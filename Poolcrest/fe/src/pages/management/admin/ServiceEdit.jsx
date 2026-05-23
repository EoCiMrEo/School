import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { servicesService } from "../../../utils/djangoServices";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  base_price: "0",
  price_unit: "service",
  duration_minutes: 0,
  response_level: "routine",
  seasonal_availability: "",
  status: true,
  is_popular: false,
  available_24_7: false,
  features: [],
  rating: 0,
  review_count: 0,
};

const ServiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await servicesService.getServiceById(id);
      if (!res.success) {
        setError(res.error || "Failed to load");
      } else {
        const d = res.data;
        setForm({
          ...emptyForm,
          ...d,
          response_level: d.response_level || d.urgency || "routine",
        });
        setPreviewUrl(d.image_url || "");
      }
      setLoading(false);
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFeaturesChange = (e) => {
    const value = e.target.value;
    const arr = value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, features: arr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Build payload: JSON when no image, FormData when image present
      const {
        rating, // likely read-only in API
        review_count, // likely read-only in API
        image_url, // computed
        image, // exclude raw image path from JSON updates
        ...rest
      } = form || {};

      // Normalize seasonal_availability: only allow '', 'spring','summer','fall','winter'
      const allowedSeasons = ["", "spring", "summer", "fall", "winter"];
      const seasonValue = (rest.seasonal_availability || "").toLowerCase();
      rest.seasonal_availability = allowedSeasons.includes(seasonValue)
        ? seasonValue || ""
        : "";

      // Sanitize numeric fields
      if (typeof rest.base_price === "string") {
        // convert comma decimal to dot
        const normalized = rest.base_price.replace(",", ".");
        rest.base_price = normalized;
      }
      if (rest.duration_minutes != null) {
        rest.duration_minutes = String(
          parseInt(rest.duration_minutes || 0, 10)
        );
      }

      let payload;
      if (imageFile) {
        const fd = new FormData();
        Object.entries(rest).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            // Send arrays as JSON string in multipart
            fd.append(k, JSON.stringify(v));
          } else if (typeof v === "boolean") {
            fd.append(k, v ? "true" : "false");
          } else if (v !== null && v !== undefined) {
            fd.append(k, v);
          }
        });
        fd.append("image", imageFile);
        payload = fd;
      } else {
        // Send plain JSON; arrays remain arrays; DO NOT include image key
        // (including a string path for FileField causes: "The submitted data was not a file")
        payload = { ...rest };
      }

      // Debug log (dev only)
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("Submitting service update", {
          id,
          payloadType: imageFile ? "multipart" : "json",
        });
      }

      const res = await servicesService.updateService(id, payload);
      if (!res.success) throw new Error(res.error || "Save failed");
      navigate(`/management-services/${id}`);
    } catch (err) {
      // Bubble up clearer API errors when present
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err.message ||
        "Update failed";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Image file change handler with dynamic preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // If cleared, fall back to existing image_url
      setPreviewUrl(form.image_url || "");
    }
  };

  // Cleanup object URL when file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {}
      }
    };
  }, [previewUrl]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded shadow p-6 space-y-4"
    >
      <h2 className="text-lg sm:text-xl font-semibold">Edit Service</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Base Price</label>
          <input
            name="base_price"
            value={form.base_price}
            onChange={handleChange}
            className="input"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Price Unit</label>
          <select
            name="price_unit"
            value={form.price_unit}
            onChange={handleChange}
            className="input"
          >
            <option value="hour">hour</option>
            <option value="service">service</option>
            <option value="week">week</option>
            <option value="project">project</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Duration (minutes)
          </label>
          <input
            name="duration_minutes"
            value={form.duration_minutes}
            onChange={handleChange}
            className="input"
            type="number"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Response Level
          </label>
          <select
            name="response_level"
            value={form.response_level}
            onChange={handleChange}
            className="input"
          >
            <option value="emergency">emergency</option>
            <option value="routine">routine</option>
            <option value="seasonal">seasonal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Seasonal</label>
          <select
            name="seasonal_availability"
            value={form.seasonal_availability || ""}
            onChange={handleChange}
            className="input"
          >
            <option value="">—</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Image</label>
          <div className="space-y-2">
            {previewUrl ? (
              <div className="w-full max-w-xs h-40 rounded border overflow-hidden bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full max-w-xs h-40 rounded border bg-gray-50 grid place-items-center text-gray-400 text-sm">
                No image
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input"
            rows={4}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">
            Features (one per line)
          </label>
          <textarea
            value={(form.features || []).join("\n")}
            onChange={handleFeaturesChange}
            className="input"
            rows={4}
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="status"
              checked={!!form.status}
              onChange={handleChange}
            />{" "}
            Active
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="is_popular"
              checked={!!form.is_popular}
              onChange={handleChange}
            />{" "}
            Popular
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="available_24_7"
              checked={!!form.available_24_7}
              onChange={handleChange}
            />{" "}
            24/7
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={saving}
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ServiceEdit;
