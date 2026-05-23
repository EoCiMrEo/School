import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesService } from "../../../utils/djangoServices";
import secureStorage from "../../../utils/secureStorage";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const CreateProperty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    // Basic Information
    property_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "US",
    // Pool Information
    pool_type: "chlorine",
    pool_size: "medium",
    pool_volume_gallons: "",
    pool_length_feet: "",
    pool_width_feet: "",
    pool_depth_shallow_feet: "",
    pool_depth_deep_feet: "",
    pool_features_text: "", // comma-separated; we'll convert to array

    // Access Information
    gate_code: "",
    access_instructions: "",
    key_location: "",
    parking_instructions: "",
    preferred_service_day: "",
    preferred_service_time: "",
    service_frequency: "weekly",
    is_primary: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setForm((p) => ({ ...p, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile = secureStorage.getUserProfile();
      const customerId =
        profile?.id || profile?.user_id || profile?.user || null;

      // Build payload, converting numeric/array fields
      const payload = {
        ...form,
        ...(customerId ? { customer_id: customerId } : {}),
      };
      // Convert comma-separated features to array
      if (payload.pool_features_text) {
        payload.pool_features = payload.pool_features_text
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      delete payload.pool_features_text;
      // Numeric conversions (if provided)
      const toNumber = [
        "pool_volume_gallons",
        "pool_length_feet",
        "pool_width_feet",
        "pool_depth_shallow_feet",
        "pool_depth_deep_feet",
      ];
      toNumber.forEach((k) => {
        if (
          payload[k] === "" ||
          payload[k] === null ||
          typeof payload[k] === "undefined"
        ) {
          delete payload[k];
        } else {
          const n = Number(payload[k]);
          if (!Number.isNaN(n)) payload[k] = n;
          else delete payload[k];
        }
      });

      const res = await propertiesService.createProperty(payload);
      if (res.success) {
        // If navigated here from quote creation, go back
        const redirectTo = sessionStorage.getItem(
          "afterCreatePropertyRedirect"
        );
        if (redirectTo) {
          sessionStorage.removeItem("afterCreatePropertyRedirect");
          navigate(redirectTo, { state: { newProperty: res.data } });
        } else {
          navigate("/properties");
        }
      } else {
        setError(res.error || "Failed to create property");
      }
    } catch (err) {
      setError("Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Add Property</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded p-6 space-y-6"
        >
          {/* Pool Information */}
          <div>
            <h3 className="font-semibold mb-3">Pool Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pool type
                </label>
                <select
                  name="pool_type"
                  value={form.pool_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="chlorine">Chlorine Pool</option>
                  <option value="saltwater">Saltwater Pool</option>
                  <option value="inground">In-Ground Pool</option>
                  <option value="above_ground">Above Ground Pool</option>
                  <option value="infinity">Infinity Pool</option>
                  <option value="lap">Lap Pool</option>
                  <option value="plunge">Plunge Pool</option>
                  <option value="spa">Spa/Hot Tub</option>
                  <option value="combo">Pool & Spa Combo</option>
                  <option value="natural">Natural Pool</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pool size
                </label>
                <select
                  name="pool_size"
                  value={form.pool_size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="small">Small (&lt; 15,000 gallons)</option>
                  <option value="medium">
                    Medium (15,000 - 30,000 gallons)
                  </option>
                  <option value="large">Large (30,000 - 50,000 gallons)</option>
                  <option value="extra_large">
                    Extra Large (&gt; 50,000 gallons)
                  </option>
                  <option value="commercial">Commercial Size</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Volume (gallons)
                </label>
                <Input
                  name="pool_volume_gallons"
                  type="number"
                  value={form.pool_volume_gallons}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Length (ft)
                </label>
                <Input
                  name="pool_length_feet"
                  type="number"
                  step="0.1"
                  value={form.pool_length_feet}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Width (ft)
                </label>
                <Input
                  name="pool_width_feet"
                  type="number"
                  step="0.1"
                  value={form.pool_width_feet}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shallow depth (ft)
                </label>
                <Input
                  name="pool_depth_shallow_feet"
                  type="number"
                  step="0.1"
                  value={form.pool_depth_shallow_feet}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Deep depth (ft)
                </label>
                <Input
                  name="pool_depth_deep_feet"
                  type="number"
                  step="0.1"
                  value={form.pool_depth_deep_feet}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">
                Pool features
              </label>
              <textarea
                name="pool_features_text"
                value={form.pool_features_text}
                onChange={handleChange}
                rows={2}
                placeholder="Comma-separated, e.g. Waterfall, Hot tub, Slide"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Property Name
            </label>
            <Input
              name="property_name"
              value={form.property_name}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_primary"
                checked={form.is_primary}
                onChange={handleCheckbox}
              />
              Is primary
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleCheckbox}
              />
              Is active
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Address line1
            </label>
            <Input
              name="address_line1"
              value={form.address_line1}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Address line2
            </label>
            <Input
              name="address_line2"
              value={form.address_line2}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input name="city" value={form.city} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Input name="state" value={form.state} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP</label>
              <Input
                name="zip_code"
                value={form.zip_code}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <Input
              name="country"
              value={form.country}
              onChange={handleChange}
            />
          </div>

          {/* Access Information */}
          <div className="pt-2">
            <h3 className="font-semibold mb-2">Access Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gate code
                </label>
                <Input
                  name="gate_code"
                  value={form.gate_code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Key location
                </label>
                <Input
                  name="key_location"
                  value={form.key_location}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Access instructions
                </label>
                <textarea
                  name="access_instructions"
                  value={form.access_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Parking instructions
                </label>
                <textarea
                  name="parking_instructions"
                  value={form.parking_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="pt-2">
            <h3 className="font-semibold mb-2">Service Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred day
                </label>
                <Input
                  name="preferred_service_day"
                  value={form.preferred_service_day}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preferred time
                </label>
                <Input
                  name="preferred_service_time"
                  value={form.preferred_service_time}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency
                </label>
                <select
                  name="service_frequency"
                  value={form.service_frequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;
