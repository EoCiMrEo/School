/**
 * Example Quote Component using Django Backend
 * This demonstrates how to use the Django services in a React component
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDjangoAuth } from "../../../contexts/DjangoAuthContext";
import {
  quotesService,
  propertiesService,
  servicesService,
} from "../../../utils/djangoServices";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Header from "../../../components/ui/Header";

const initialFormState = {
  title: "",
  description: "",
  property_id: "",
  requested_services: [],
  items: [],
  contact_email: "",
  contact_first_name: "",
  contact_last_name: "",
  contact_phone: "",
};

const CreateQuote = ({ allowGuest = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isAuthenticated } = useDjangoAuth();
  const isUserAuthenticated = isAuthenticated();

  // Form state
  const [formData, setFormData] = useState(initialFormState);

  // Data state
  const [properties, setProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const guestMode = allowGuest && !isUserAuthenticated;

  // Load user's properties and available services on mount
  useEffect(() => {
    loadInitialData();
  }, [isUserAuthenticated]);

  useEffect(() => {
    if (isUserAuthenticated && userProfile) {
      setFormData((prev) => ({
        ...prev,
        contact_email:
          prev.contact_email ||
          userProfile?.email ||
          userProfile?.user_email ||
          userProfile?.user?.email ||
          "",
        contact_first_name:
          prev.contact_first_name ||
          userProfile?.first_name ||
          (userProfile?.full_name
            ? userProfile.full_name.split(" ")[0]
            : ""),
        contact_last_name:
          prev.contact_last_name ||
          userProfile?.last_name ||
          (userProfile?.full_name
            ? userProfile.full_name.split(" ").slice(1).join(" ")
            : ""),
        contact_phone: prev.contact_phone || userProfile?.phone || "",
      }));
    }
  }, [isUserAuthenticated, userProfile]);

  // If we returned from property creation with a new property, preselect it
  useEffect(() => {
    const newProp = location.state?.newProperty;
    if (newProp?.id) {
      setFormData((p) => ({ ...p, property_id: newProp.id }));
    }
  }, [location.state]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const queryId = params.get("edit");
    const stateId = location.state?.editQuoteId;
    const targetId = stateId || queryId;

    if (isUserAuthenticated && targetId && targetId !== editingQuoteId) {
      loadDraft(targetId);
    }
  }, [location.search, location.state, editingQuoteId, isUserAuthenticated]);

  const loadDraft = async (quoteId) => {
    if (!isUserAuthenticated) {
      const wrapperPadding = allowGuest ? "pt-24 pb-12" : "py-8";

      return (
        <>
          {allowGuest && <Header />}
          <div className={`min-h-screen bg-gray-50 ${wrapperPadding}`}>
            <div className="max-w-3xl mx-auto px-4">)
              <h1 className="text-2xl font-bold mb-4">Edit Quote</h1>
              {isLoadingEdit && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{successMessage}</p>}
            </div>
          </div>
        </>
      );
    }

    setIsLoadingEdit(true);
    setError(null);
    const res = await quotesService.getQuoteById(quoteId);
    if (!res.success) {
      setError(res.error || "Failed to load draft quote");
        return;
      }
    try {
      const data = res.data || {};
      const rawItems = Array.isArray(data.items) ? data.items : [];
      const loadedServices = [];
      const loadedLineItems = [];

      rawItems.forEach((item) => {
        // Check if this item matches the default service definition (checkbox candidate)
        // Criteria: linked service, quantity 1, price match, description match
        const svc = item.service_detail;
        const isDefault =
          svc &&
          Number(item.quantity) === 1 &&
          Number(item.unit_price) === Number(svc.base_price) &&
          item.description === svc.name;

        if (isDefault) {
          loadedServices.push(item.service);
        } else {
          loadedLineItems.push({
            item_type: item.item_type || "service",
            service: item.service,
            category: svc?.category || "", // Attempt to populate category for UI dropdown
            description: item.description || "",
            quantity: Number(item.quantity || 1),
            unit_price: Number(item.unit_price || 0),
            duration_minutes: svc?.duration_minutes,
          });
        }
      });

      setFormData({
        title: data.title || "",
        description: data.description || "",
        property_id: data.property_ref?.id || "",
        requested_services: loadedServices,
        items: loadedLineItems,
        contact_email: data.contact_email || "",
        contact_first_name: data.contact_first_name || "",
        contact_last_name: data.contact_last_name || "",
        contact_phone: data.contact_phone || "",
      });
      setEditingQuoteId(quoteId);
      
    } catch (err) {
      setError("Failed to load draft quote");
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const loadInitialData = async () => {
    try {
      if (isUserAuthenticated) {
        const propertiesResult = await propertiesService.getMyProperties();
        if (propertiesResult.success) {
          setProperties(propertiesResult.data);
        }
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
      setProperties([]);
    }

    try {
      const servicesResult = await servicesService.getServices({ status: true });
      if (servicesResult.success) {
        setServices(servicesResult.data);
      }
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      requested_services: prev.requested_services.includes(serviceId)
        ? prev.requested_services.filter((id) => id !== serviceId)
        : [...prev.requested_services, serviceId],
    }));
  };

  const handleCancel = () => {
    if (guestMode) {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e, { draft = false } = {}) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage("");

    try {
  const isDraft = !guestMode && draft;

      const contactEmail = (formData.contact_email || "").trim();
      const contactFirstName = (formData.contact_first_name || "").trim();
      const contactLastName = (formData.contact_last_name || "").trim();
      const contactPhone = (formData.contact_phone || "").trim();

      // Validate form (lighter for drafts)
      if (!formData.title.trim()) {
        throw new Error("Please enter a title for your quote request");
      }
      if (!isDraft && !formData.description.trim()) {
        throw new Error("Please describe what you need");
      }
      if (guestMode && !contactEmail) {
        throw new Error("Please provide an email address so we can reach you");
      }

      // Prepare items: keep only fields the API accepts
      const sanitizeItems = (items) =>
        (Array.isArray(items) ? items : [])
          .filter((it) => it && it.service) // require a chosen service
          .map((it) => ({
            item_type: "service",
            service: it.service,
            description: it.description || "",
            quantity: Number(it.quantity || 1),
            unit_price: Number(it.unit_price || 0),
          }));

      const payload = {
        title: formData.title,
        description: formData.description,
        property_id: isUserAuthenticated ? formData.property_id || null : null,
        requested_services: formData.requested_services,
        notes: "",
        items: sanitizeItems(formData.items),
      };

      if (guestMode) {
        payload.save_as_draft = false;
        payload.contact_email = contactEmail;
        if (contactFirstName) {
          payload.contact_first_name = contactFirstName;
        }
        if (contactLastName) {
          payload.contact_last_name = contactLastName;
        }
        if (contactPhone) {
          payload.contact_phone = contactPhone;
        }
      } else {
        payload.save_as_draft = isDraft;
        payload.customer_id =
          userProfile?.id || userProfile?.user_id || userProfile?.user;

        if (contactEmail) {
          payload.contact_email = contactEmail;
        }
        if (contactFirstName) {
          payload.contact_first_name = contactFirstName;
        }
        if (contactLastName) {
          payload.contact_last_name = contactLastName;
        }
        if (contactPhone) {
          payload.contact_phone = contactPhone;
        }
      }

      let result;

      if (!guestMode && editingQuoteId) {
        result = await quotesService.updateDraftQuote(editingQuoteId, payload);

        if (result.success && !isDraft) {
          const submitResult = await quotesService.submitDraftQuote(
            editingQuoteId
          );

          if (!submitResult.success) {
            setError(submitResult.error || "Failed to submit quote");
            setLoading(false);
            return;
          }
        }
      } else {
        result = await quotesService.createQuote(payload);
      }

      if (result.success) {
        setSuccess(true);
        const createdQuote = result.data;
        const quoteLabel = createdQuote?.quote_number
          ? `Quote ${createdQuote.quote_number}`
          : "Quote request";

        setSuccessMessage(
          guestMode
            ? `Thanks! Your quote request is on its way. We\'ll reach out${
                contactEmail ? ` at ${contactEmail}` : ""
              } soon.`
            : `${quoteLabel} ${editingQuoteId ? "updated" : "created"} successfully! Redirecting to your dashboard...`
        );

        if (guestMode) {
          setFormData((prev) => ({
            ...initialFormState,
            contact_email: contactEmail,
            contact_first_name: contactFirstName,
            contact_last_name: contactLastName,
            contact_phone: contactPhone,
          }));
        }

        // Brief success message then go to quotes list
        if (!guestMode) {
          setTimeout(() => {
            navigate("/quotes");
          }, 1200);
        }
      } else {
        setError(result.error || "Failed to create quote");
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating the quote");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = () => {
    if (!isUserAuthenticated) {
      navigate("/auth/login", {
        state: { from: allowGuest ? "/request-quote" : "/quotes/create" },
      });
      return;
    }
    // Remember to return to this page afterwards
    sessionStorage.setItem(
      "afterCreatePropertyRedirect",
      allowGuest ? "/request-quote" : "/quotes/create"
    );
    navigate("/properties/create");
  };

  // Require login unless guest mode is enabled
  if (!allowGuest && !isUserAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="mb-4">You need to be logged in to request a quote.</p>
          <Button onClick={() => navigate("/auth/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const wrapperPadding = allowGuest ? "pt-24 pb-12" : "py-8";

  return (
    <>
      {allowGuest && <Header />}
      <div className={`min-h-screen bg-gray-50 ${wrapperPadding}`}>
        <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          {editingQuoteId ? "Edit Draft Quote" : "Request a Quote"}
        </h1>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage ||
              `✓ Quote request ${
                editingQuoteId ? "updated" : "created"
              } successfully!`}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Quote Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          {isLoadingEdit && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">
              Loading draft...
            </div>
          )}
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Monthly Pool Maintenance"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please describe what service you need..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          {/* Contact Details */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <label className="text-sm font-medium">
                Contact Information {guestMode ? "(required)" : "(optional)"}
              </label>
              {guestMode && (
                <span className="text-xs text-gray-500">
                  We\'ll use this to follow up about your request.
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="contact_first_name"
                value={formData.contact_first_name}
                onChange={handleInputChange}
                placeholder="First name"
                disabled={loading}
              />
              <Input
                name="contact_last_name"
                value={formData.contact_last_name}
                onChange={handleInputChange}
                placeholder="Last name"
                disabled={loading}
              />
              <Input
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="Email address"
                required={guestMode}
                disabled={loading}
                className="sm:col-span-2"
              />
              <Input
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="Phone (optional)"
                disabled={loading}
                className="sm:col-span-2"
              />
            </div>
          </div>

          {/* Property Selection (Optional) */}
          {isUserAuthenticated && properties.length > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Property (Optional)
              </label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select a property...</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.property_name || property.address}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateProperty}
                >
                  + Create New Property
                </Button>
              </div>
            </div>
          ) : isUserAuthenticated ? (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Property</label>
              <div className="p-3 rounded border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 flex items-center justify-between">
                <span>No properties yet.</span>
                <Button type="button" size="sm" onClick={handleCreateProperty}>
                  + Add Property
                </Button>
              </div>
            </div>
          ) : null}

          {/* Services Selection (Optional) */}
          {services.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Interested Services (Optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.requested_services.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      disabled={loading}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{service.name}</span>
                      {service.base_price && (
                        <span className="text-sm text-gray-500 ml-2">
                          Starting at ${service.base_price}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Services Editor (category -> service dependent dropdown) */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Services (optional)
            </label>
            <div className="space-y-2">
              {Array.isArray(formData.items) && formData.items.length === 0 && (
                <p className="text-sm text-gray-500">No services added yet.</p>
              )}
              {formData.items.map((item, idx) => {
                const categories = Array.from(
                  new Set(
                    (Array.isArray(services) ? services : []).map(
                      (s) => s.category || "Uncategorized"
                    )
                  )
                );
                const filteredServices = (
                  Array.isArray(services) ? services : []
                ).filter(
                  (s) =>
                    (item.category || "Uncategorized") ===
                    (s.category || "Uncategorized")
                );
                const selectedService = (
                  Array.isArray(services) ? services : []
                ).find((s) => String(s.id) === String(item.service));
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    {/* Category */}
                    <select
                      value={item.category || ""}
                      onChange={(e) => {
                        const category = e.target.value;
                        setFormData((p) => {
                          const items = [...p.items];
                          // Reset service when category changes
                          items[idx] = {
                            ...items[idx],
                            category,
                            service: "",
                            description: "",
                            unit_price: 0,
                            duration_minutes: undefined,
                            item_type: "service",
                          };
                          return { ...p, items };
                        });
                      }}
                      className="sm:col-span-3 px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Service (filtered by category) */}
                    <select
                      value={item.service || ""}
                      onChange={(e) => {
                        const serviceId = e.target.value || null;
                        const list = filteredServices;
                        const svc =
                          list.find(
                            (s) => String(s.id) === String(serviceId)
                          ) || selectedService;
                        setFormData((p) => {
                          const items = [...p.items];
                          items[idx] = {
                            ...items[idx],
                            item_type: "service",
                            service: serviceId,
                            description:
                              items[idx].description || svc?.name || "",
                            unit_price:
                              items[idx].unit_price &&
                              Number(items[idx].unit_price) > 0
                                ? items[idx].unit_price
                                : svc?.base_price ?? 0,
                            duration_minutes: svc?.duration_minutes,
                          };
                          return { ...p, items };
                        });
                      }}
                      className="sm:col-span-4 px-3 py-2 border border-gray-300 rounded"
                      disabled={!item.category}
                    >
                      <option value="">Select a service…</option>
                      {filteredServices.map((svc) => (
                        <option key={svc.id} value={svc.id}>
                          {svc.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Qty"
                      type="number"
                      value={item.quantity || 1}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || 1, 10);
                        setFormData((p) => {
                          const items = [...p.items];
                          items[idx] = { ...items[idx], quantity: v };
                          return { ...p, items };
                        });
                      }}
                      className="sm:col-span-2"
                    />
                    <Input
                      placeholder="Unit Price"
                      type="number"
                      value={item.unit_price || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value || 0);
                        setFormData((p) => {
                          const items = [...p.items];
                          items[idx] = { ...items[idx], unit_price: v };
                          return { ...p, items };
                        });
                      }}
                      className="sm:col-span-2"
                    />
                    {/* Duration display (read-only from service) */}
                    <Input
                      placeholder="Duration (min)"
                      type="number"
                      value={
                        selectedService?.duration_minutes ??
                        item.duration_minutes ??
                        ""
                      }
                      disabled
                      className="sm:col-span-1"
                    />
                    <button
                      type="button"
                      className="text-red-600 text-sm"
                      onClick={() => {
                        setFormData((p) => ({
                          ...p,
                          items: p.items.filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    items: [
                      ...p.items,
                      {
                        item_type: "service",
                        category: "",
                        service: "",
                        description: "",
                        quantity: 1,
                        unit_price: 0,
                      },
                    ],
                  }))
                }
              >
                + Add Service
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {isUserAuthenticated && (
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, { draft: true })}
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-[140px]"
              >
                {loading ? "Saving..." : "Save as Draft"}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto sm:min-w-[160px]"
            >
              {loading
                ? guestMode
                  ? "Sending..."
                  : "Creating..."
                : guestMode
                ? "Send Quote Request"
                : "Submit Quote Request"}
            </Button>
          </div>
        </form>

        {/* User Info */}
        {isUserAuthenticated ? (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Requesting as:</strong>{" "}
              {userProfile?.full_name || userProfile?.email}
            </p>
            {userProfile?.phone && (
              <p className="text-sm text-blue-700">
                <strong>Contact:</strong> {userProfile.phone}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p className="font-medium">
              No account? No problem—submit your request and our team will follow up.
            </p>
            <p className="mt-2">
              Want to track quotes online later? Create an account with the same email and we\'ll link everything automatically.
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default CreateQuote;
