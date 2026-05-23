import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { servicesService } from "../../../utils/djangoServices";
import Icon from "../../../components/AppIcon";

const Label = ({ className = "", children }) => (
  <div className={`text-xs uppercase tracking-wide text-gray-500 ${className}`}>
    {children}
  </div>
);

const Value = ({ className = "", children }) => (
  <div className={`text-sm text-gray-900 font-medium ${className}`}>
    {children || "—"}
  </div>
);

const Badge = ({ color = "gray", children }) => {
  const colors = {
    green: "bg-green-50 text-green-700 ring-green-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    gray: "bg-gray-50 text-gray-700 ring-gray-600/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};

const prettyUnit = (u) => {
  switch (u) {
    case "hour":
      return "/hr";
    case "service":
      return "/service";
    case "week":
      return "/week";
    case "project":
      return "/project";
    default:
      return "";
  }
};

const ServiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [svc, setSvc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await servicesService.getServiceById(id);
      if (!res.success) {
        setError(res.error || "Failed to load");
      } else {
        const d = res.data || {};
        setSvc({
          ...d,
          response_level: d.response_level || d.urgency || "routine",
        });
        setError(null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!svc) return <div>Not found.</div>;

  const {
    name,
    category,
    description,
    base_price,
    price_unit,
    duration_minutes,
    response_level,
    seasonal_availability,
    image_url,
    status,
    is_popular,
    available_24_7,
    rating,
    review_count,
    features,
  } = svc;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Service Details</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
            onClick={() => navigate(`/management-services/${id}/edit`)}
          >
            <span className="inline-flex items-center gap-2">
              <Icon name="Pencil" size={16} /> Edit
            </span>
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image */}
          <div className="sm:w-1/3">
            <div className="w-full max-w-md h-56 sm:h-64 overflow-hidden rounded border bg-gray-50 mx-auto">
              {image_url ? (
                <img
                  src={image_url}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-400">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Icon name="Image" /> No image
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge color={status ? "green" : "red"}>
                {status ? "Active" : "Inactive"}
              </Badge>
              {is_popular && <Badge color="amber">Most Popular</Badge>}
              {available_24_7 && <Badge color="blue">24/7 Available</Badge>}
            </div>
          </div>

          {/* Details */}
          <div className="sm:flex-1 space-y-4">
            <div>
              <div className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                {name}
                {category && (
                  <span className="text-sm font-normal text-gray-500">
                    • {category}
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Base Price</Label>
                <Value>
                  ${base_price}
                  <span className="text-gray-500 ml-1">
                    {prettyUnit(price_unit)}
                  </span>
                </Value>
              </div>
              <div>
                <Label>Duration</Label>
                <Value>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="Clock" size={14} /> {duration_minutes || 0}{" "}
                    minutes
                  </span>
                </Value>
              </div>
              <div>
                <Label>Response Level</Label>
                <Value className="capitalize">{response_level}</Value>
              </div>
              <div>
                <Label>Seasonal Availability</Label>
                <Value className="capitalize">
                  {seasonal_availability || "—"}
                </Value>
              </div>
              <div>
                <Label>Rating</Label>
                <Value>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="Star" className="text-amber-500" />
                    {Number(rating || 0).toFixed(1)}
                    <span className="text-gray-500">({review_count || 0})</span>
                  </span>
                </Value>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded shadow p-4 sm:p-6">
        <h3 className="text-base font-semibold mb-3">Included Features</h3>
        {Array.isArray(features) && features.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside text-sm text-gray-800">
            {features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No features listed.</div>
        )}
      </div>
    </div>
  );
};

export default ServiceView;
