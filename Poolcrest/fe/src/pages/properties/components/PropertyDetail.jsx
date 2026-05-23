import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertiesService } from "../../../utils/djangoServices";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await propertiesService.getPropertyById(id);
      if (res.success) setProperty(res.data);
      else setError(res.error || "Failed to load property");
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Icon name="Loader2" size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
        <Button variant="secondary" onClick={() => navigate("/properties")}>
          Back
        </Button>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{property.display_name}</h1>
        <Button variant="secondary" onClick={() => navigate("/properties")}>
          Back
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <p className="text-sm text-gray-600">{property.full_address}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pool</h2>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Type:</strong> {property.pool_type}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Size:</strong> {property.pool_size}
          </p>
          {property.pool_volume_gallons && (
            <p className="text-sm text-gray-600">
              <strong>Volume:</strong> {property.pool_volume_gallons} gal
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
