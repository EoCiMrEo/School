/**
 * Django Backend Services
 * Handles all API operations with the Django backend
 */

import { api } from "./api";
import secureStorage from "./secureStorage";

const resolveCustomerId = async (explicitId) => {
  if (explicitId) {
    return explicitId;
  }

  const cachedProfile = secureStorage.getUserProfile();
  const cachedId =
    cachedProfile?.id || cachedProfile?.user_id || cachedProfile?.user || null;

  if (cachedId) {
    return cachedId;
  }

  try {
    const response = await api.get("/users/auth/me/");
    const profileData = response.data?.profile || response.data;

    const resolvedId =
      profileData?.id ||
      profileData?.user_id ||
      profileData?.user ||
      null;

    if (resolvedId && profileData) {
      secureStorage.setUserProfile(profileData);
    }

    return resolvedId;
  } catch (error) {
    return null;
  }
};

// Quotes Management
export const quotesService = {
  /**
   * Get all quotes (filtered by user role)
   */
  async getQuotes(params = {}) {
    try {
      const response = await api.get("/quotes/", { params });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = typeof data?.count === "number" ? data.count : items.length;
      return { success: true, data: items, count };
    } catch (error) {
      return { success: false, error: "Failed to fetch quotes" };
    }
  },

  /**
   * Get customer's quotes
   */
  async getMyQuotes(params = {}) {
    try {
      const response = await api.get("/quotes/my_quotes/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch your quotes" };
    }
  },

  /**
   * Get quote by ID
   */
  async getQuoteById(id) {
    try {
      const response = await api.get(`/quotes/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch quote details" };
    }
  },

  /**
   * Create a new quote request
   */
  async createQuote(quoteData) {
    try {
      const sanitizedItems = Array.isArray(quoteData.items)
        ? quoteData.items.filter(Boolean)
        : [];

      const payload = {
        title: quoteData.title,
        description: quoteData.description,
        property_id: quoteData.property_id || null,
        requested_services: quoteData.requested_services || [],
        notes: quoteData.notes || "",
      };

      if (sanitizedItems.length > 0) {
        payload.items = sanitizedItems;
      }

      // Attach optional contact fields regardless of mode
      if (quoteData.contact_email) {
        payload.contact_email = quoteData.contact_email.trim();
      }
      if (quoteData.contact_first_name) {
        payload.contact_first_name = quoteData.contact_first_name.trim();
      }
      if (quoteData.contact_last_name) {
        payload.contact_last_name = quoteData.contact_last_name.trim();
      }
      if (quoteData.contact_phone) {
        payload.contact_phone = quoteData.contact_phone.trim();
      }

      // Determine flow: authenticated (customer id resolvable) vs guest
      const customerId = await resolveCustomerId(
        quoteData?.customer_id || quoteData?.customer
      );

      if (customerId) {
        // Authenticated flow: honor save_as_draft flag
        payload.customer_id = customerId;
        payload.save_as_draft = !!quoteData.save_as_draft;
      } else {
        // Guest flow: require contact email and always submit (no drafts for guests)
        const hasGuestContact = Boolean(
          (quoteData.contact_email || "").trim().length > 0
        );
        if (!hasGuestContact) {
          throw new Error(
            "Missing customer profile. Please sign in or provide contact details."
          );
        }
        payload.save_as_draft = false;
      }

      const response = await api.post("/quotes/", payload);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to create quote";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update an existing draft quote
   */
  async updateDraftQuote(id, updates) {
    try {
      const payload = {
        ...updates,
      };

      if (payload.customer_id || payload.customer) {
        payload.customer_id = await resolveCustomerId(
          payload.customer_id || payload.customer
        );
        delete payload.customer;
      }

      const response = await api.patch(`/quotes/${id}/update_draft/`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.customer_id?.[0] ||
        error.response?.data?.title?.[0] ||
        "Failed to update draft quote";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Submit a draft quote for processing
   */
  async submitDraftQuote(id) {
    try {
      const response = await api.post(`/quotes/${id}/submit/`);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to submit quote";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Delete a draft quote
   */
  async deleteDraftQuote(id) {
    try {
      await api.delete(`/quotes/${id}/delete_draft/`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to delete quote";
      return { success: false, error: errorMessage };
    }
  },

  async adminConfirmQuote(id, data = {}) {
    try {
      const response = await api.post(`/quotes/${id}/admin-confirm/`, data);
      return {
        success: true,
        data: response.data?.quote,
        message: response.data?.message,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to confirm quote";
      return { success: false, error: errorMessage };
    }
  },

  async adminRejectQuote(id, data = {}) {
    try {
      const response = await api.post(`/quotes/${id}/admin-reject/`, data);
      return {
        success: true,
        data: response.data?.quote,
        message: response.data?.message,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to reject quote";
      return { success: false, error: errorMessage };
    }
  },

  async adminCompleteQuote(id, data = {}) {
    try {
      const response = await api.post(`/quotes/${id}/admin-complete/`, data);
      return {
        success: true,
        data: response.data?.quote,
        message: response.data?.message,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to mark quote as processed";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Process quote (staff only)
   */
  async processQuote(id, processData) {
    try {
      const response = await api.post(`/quotes/${id}/process/`, processData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to process quote" };
    }
  },

  /**
   * Send quote to customer (staff only)
   */
  async sendToCustomer(id, message = "") {
    try {
      const response = await api.post(`/quotes/${id}/send_to_customer/`, {
        message,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to send quote" };
    }
  },

  /**
   * Customer confirms quote
   */
  async confirmQuote(id) {
    try {
      const response = await api.post(`/quotes/${id}/confirm/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to confirm quote" };
    }
  },

  /**
   * Create a Stripe Checkout session for a quote and return the redirect URL
   */
  async createCheckoutSession(id) {
    try {
      const response = await api.post(`/quotes/${id}/create_checkout_session/`);
      const url = response.data?.url;
      if (!url) throw new Error("Missing checkout URL");
      return { success: true, url };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to start checkout";
      return { success: false, error: msg };
    }
  },

  /**
   * Verify a Stripe Checkout session and update quote status if paid
   */
  async verifyPayment(id, sessionId) {
    try {
      const response = await api.post(`/quotes/${id}/verify_payment/`, {
        session_id: sessionId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to verify payment";
      return { success: false, error: msg };
    }
  },

  /**
   * Customer rejects quote
   */
  async rejectQuote(id, reason = "") {
    try {
      const response = await api.post(`/quotes/${id}/reject/`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to reject quote" };
    }
  },

  /**
   * Apply promotion code
   */
  async applyPromotion(id, promotionCode) {
    try {
      const response = await api.post(`/quotes/${id}/apply_promotion/`, {
        promotion_code: promotionCode,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to apply promotion",
      };
    }
  },

  /**
   * Mark quote as viewed
   */
  async markViewed(id) {
    try {
      const response = await api.post(`/quotes/${id}/mark_viewed/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to mark as viewed" };
    }
  },

  /**
   * Get quote statistics (staff only)
   */
  async getStatistics() {
    try {
      const response = await api.get("/quotes/statistics/");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch statistics" };
    }
  },
};

// Payments / Billing
export const paymentsService = {
  /**
   * Get current user's payment history
   */
  async getMyPayments(params = {}) {
    try {
      const response = await api.get("/payments/my/", { params });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: "Failed to fetch payment history" };
    }
  },
};

// Properties Management
export const propertiesService = {
  /**
   * Get all properties
   */
  async getProperties(params = {}) {
    try {
      const response = await api.get("/properties/", { params });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = typeof data?.count === "number" ? data.count : items.length;
      return { success: true, data: items, count };
    } catch (error) {
      return { success: false, error: "Failed to fetch properties" };
    }
  },

  /**
   * Get customer's properties
   */
  async getMyProperties() {
    try {
      const response = await api.get("/properties/my_properties/");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch your properties" };
    }
  },

  /**
   * Get property by ID
   */
  async getPropertyById(id) {
    try {
      const response = await api.get(`/properties/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch property" };
    }
  },

  /**
   * Create property
   */
  async createProperty(propertyData) {
    try {
      const customerId = await resolveCustomerId(propertyData?.customer_id);

      if (!customerId) {
        throw new Error(
          "Missing customer profile. Please refresh the page or log in again."
        );
      }

      const payload = {
        ...propertyData,
        customer_id: customerId,
      };

      const response = await api.post("/properties/", payload);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.customer_id?.[0] ||
        error.message ||
        "Failed to create property";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update property
   */
  async updateProperty(id, updates) {
    try {
      const response = await api.patch(`/properties/${id}/`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to update property" };
    }
  },

  /**
   * Delete property
   */
  async deleteProperty(id) {
    try {
      await api.delete(`/properties/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to delete property" };
    }
  },

  /**
   * Toggle property active status
   */
  async toggleActive(id) {
    try {
      const response = await api.post(`/properties/${id}/toggle_active/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to toggle property status" };
    }
  },
};

// Services Management
export const servicesService = {
  /**
   * Get all services
   */
  async getServices(params = {}) {
    try {
      // Default to fetching all services (up to 100) unless specified
      const finalParams = { page_size: 100, ...params };
      const response = await api.get("/services/", { params: finalParams });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = typeof data?.count === "number" ? data.count : items.length;
      return { success: true, data: items, count };
    } catch (error) {
      return { success: false, error: "Failed to fetch services" };
    }
  },

  /**
   * Get services by category
   */
  async getServicesByCategory(category) {
    try {
      const response = await api.get("/services/", {
        params: { category, status: true, page_size: 100 },
      });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = typeof data?.count === "number" ? data.count : items.length;
      return { success: true, data: items, count };
    } catch (error) {
      return { success: false, error: "Failed to fetch services by category" };
    }
  },

  /**
   * Get service by ID
   */
  async getServiceById(id) {
    try {
      const response = await api.get(`/services/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch service" };
    }
  },

  /**
   * Create service (admin only)
   */
  async createService(serviceData) {
    try {
      // Support file upload via FormData
      let response;
      if (serviceData instanceof FormData) {
        response = await api.post("/services/", serviceData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/services/", serviceData);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to create service" };
    }
  },

  /**
   * Update service (admin only)
   */
  async updateService(id, updates) {
    try {
      let response;
      if (updates instanceof FormData) {
        response = await api.patch(`/services/${id}/`, updates, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.patch(`/services/${id}/`, updates);
      }
      return { success: true, data: response.data };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.statusText ||
        error.message ||
        "Failed to update service";
      return { success: false, error: msg };
    }
  },

  /**
   * Toggle service status
   */
  async toggleStatus(id) {
    try {
      const response = await api.post(`/services/${id}/toggle_status/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to toggle service status" };
    }
  },

  /**
   * Delete service (admin only)
   */
  async deleteService(id) {
    try {
      await api.delete(`/services/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to delete service" };
    }
  },
};

// Appointments Management
export const appointmentsService = {
  /**
   * Get appointments
   */
  async getAppointments(params = {}) {
    try {
      const response = await api.get("/appointments/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch appointments" };
    }
  },

  /**
   * Get customer appointments
   */
  async getMyAppointments() {
    try {
      const response = await api.get("/appointments/my_appointments/");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch your appointments" };
    }
  },

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch appointment" };
    }
  },

  /**
   * Create appointment
   */
  async createAppointment(appointmentData) {
    try {
      const response = await api.post("/appointments/", appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to create appointment" };
    }
  },

  /**
   * Update appointment
   */
  async updateAppointment(id, updates) {
    try {
      const response = await api.patch(`/appointments/${id}/`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to update appointment" };
    }
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id, reason = "") {
    try {
      const response = await api.post(`/appointments/${id}/cancel/`, {
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to cancel appointment" };
    }
  },

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(id, newDateTime) {
    try {
      const response = await api.post(`/appointments/${id}/reschedule/`, {
        new_date: newDateTime.date,
        new_time: newDateTime.time,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to reschedule appointment" };
    }
  },

  /**
   * Confirm appointment
   */
  async confirmAppointment(id) {
    try {
      const response = await api.post(`/appointments/${id}/confirm/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to confirm appointment" };
    }
  },

  /**
   * Complete appointment (technician)
   */
  async completeAppointment(id, completionData) {
    try {
      const response = await api.post(
        `/appointments/${id}/complete/`,
        completionData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to complete appointment" };
    }
  },

  /**
   * Get available time slots
   */
  async getAvailableSlots(date, serviceId) {
    try {
      const response = await api.get("/appointments/available_slots/", {
        params: { date, service_id: serviceId },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch available slots" };
    }
  },
};

// Promotions Management
export const promotionsService = {
  /**
   * Get all promotions
   */
  async getPromotions(params = {}) {
    try {
      const response = await api.get("/promotions/", { params });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = typeof data?.count === "number" ? data.count : items.length;
      return { success: true, data: items, count };
    } catch (error) {
      return { success: false, error: "Failed to fetch promotions" };
    }
  },

  /**
   * Check promotion code validity
   */
  async checkCode(code) {
    try {
      const response = await api.get("/promotions/check_code/", {
        params: { code },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Invalid promotion code" };
    }
  },

  /**
   * Get promotion by ID
   */
  async getPromotionById(id) {
    try {
      const response = await api.get(`/promotions/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch promotion" };
    }
  },

  /**
   * Create promotion (admin only)
   */
  async createPromotion(promotionData) {
    try {
      const response = await api.post("/promotions/", promotionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to create promotion" };
    }
  },

  /**
   * Update promotion (admin only)
   */
  async updatePromotion(id, updates) {
    try {
      const response = await api.patch(`/promotions/${id}/`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to update promotion" };
    }
  },

  /**
   * Toggle promotion active status
   */
  async toggleActive(id) {
    try {
      const response = await api.post(`/promotions/${id}/toggle_active/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to toggle promotion status" };
    }
  },

  /**
   * Get promotion usage report
   */
  async getUsageReport(id) {
    try {
      const response = await api.get(`/promotions/${id}/usage_report/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch usage report" };
    }
  },

  /**
   * Delete promotion (admin only)
   */
  async deletePromotion(id) {
    try {
      await api.delete(`/promotions/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to delete promotion" };
    }
  },
};

// User Profiles Management
export const profilesService = {
  /**
   * Get all profiles (admin only)
   */
  async getProfiles(params = {}) {
    try {
      const response = await api.get("/users/profiles/", { params });
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = typeof data?.count === "number" ? data.count : items.length;
      return { success: true, data, items, count };
    } catch (error) {
      return { success: false, error: "Failed to fetch profiles" };
    }
  },

  /**
   * Get profile by ID
   */
  async getProfileById(id) {
    try {
      const response = await api.get(`/users/profiles/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to fetch profile" };
    }
  },

  /**
   * Update profile
   */
  async updateProfile(id, updates) {
    try {
      const response = await api.patch(`/users/profiles/${id}/`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to update profile" };
    }
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(id, preferences) {
    try {
      const response = await api.post(
        `/users/profiles/${id}/update_notification_preferences/`,
        {
          preferences,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to update preferences" };
    }
  },

  /**
   * Change user role (admin only)
   */
  async changeRole(id, newRole) {
    try {
      const response = await api.post(`/users/profiles/${id}/change_role/`, {
        role: newRole,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to change role" };
    }
  },

  /**
   * Toggle user status (admin only)
   */
  async toggleStatus(id) {
    try {
      const response = await api.post(`/users/profiles/${id}/toggle_status/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to toggle status" };
    }
  },
};

// Export all services
export default {
  quotesService,
  propertiesService,
  servicesService,
  appointmentsService,
  promotionsService,
  profilesService,
};
