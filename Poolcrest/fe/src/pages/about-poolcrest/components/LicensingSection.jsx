import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const LicensingSection = () => {
  const credentials = [
    {
      id: 1,
      title: "State Pool Contractor License",
      number: "PCL-2023-4567",
      issuer: "State Licensing Board",
      status: "Active",
      expiry: "December 2024",
      description: "Full authorization to perform pool construction, repair, and maintenance services",
      icon: "Award"
    },
    {
      id: 2,
      title: "EPA Chemical Handler Certification",
      number: "EPA-CH-8901",
      issuer: "Environmental Protection Agency",
      status: "Active",
      expiry: "March 2025",
      description: "Certified for safe handling and application of pool chemicals and sanitizers",
      icon: "Shield"
    },
    {
      id: 3,
      title: "NSPF Pool Operator Certification",
      number: "NSPF-PO-2345",
      issuer: "National Swimming Pool Foundation",
      status: "Active",
      expiry: "June 2024",
      description: "Advanced certification in pool water chemistry and equipment operation",
      icon: "Droplets"
    },
    {
      id: 4,
      title: "Business License",
      number: "BL-2023-7890",
      issuer: "City Business Authority",
      status: "Active",
      expiry: "January 2025",
      description: "Licensed to operate pool service business in our service area",
      icon: "Building"
    }
  ];

  const insuranceCoverage = [
    {
      type: "General Liability",
      coverage: "$2,000,000",
      description: "Protects against property damage and bodily injury claims during service",
      icon: "Shield"
    },
    {
      type: "Professional Liability",
      coverage: "$1,000,000",
      description: "Coverage for errors and omissions in professional pool care services",
      icon: "FileText"
    },
    {
      type: "Workers\' Compensation",
      coverage: "Full Coverage",
      description: "Complete protection for all team members while working on your property",
      icon: "Users"
    },
    {
      type: "Equipment Coverage",
      coverage: "$500,000",
      description: "Insurance for all professional equipment and tools used in service",
      icon: "Wrench"
    }
  ];

  const associations = [
    {
      name: "National Swimming Pool Foundation",
      role: "Certified Member",
      since: "2008",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Pool & Hot Tub Alliance",
      role: "Active Member",
      since: "2010",
      logo: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Better Business Bureau",
      role: "A+ Rating",
      since: "2012",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 pool-gradient rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} color="white" />
            </div>
            <span className="text-accent font-inter font-semibold text-lg">Trust & Credentials</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Fully Licensed, Insured & Certified
          </h2>
          <p className="text-xl text-text-secondary font-inter max-w-3xl mx-auto leading-relaxed">
            Your peace of mind is our priority. We maintain all required licenses, comprehensive insurance coverage, 
            and industry certifications to protect your family and property.
          </p>
        </div>

        {/* Licensing Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Professional Licenses & Certifications
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {credentials.map((credential) => (
              <div key={credential.id} className="bg-surface rounded-xl p-6 border border-border-light hover:shadow-lg transition-smooth">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={credential.icon} size={20} color="var(--color-primary)" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-inter font-semibold text-text-primary">{credential.title}</h4>
                      <span className="bg-success-100 text-success text-xs font-inter font-medium px-2 py-1 rounded-md">
                        {credential.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-text-secondary font-inter">
                        <span className="font-medium">License #:</span> {credential.number}
                      </p>
                      <p className="text-sm text-text-secondary font-inter">
                        <span className="font-medium">Issued by:</span> {credential.issuer}
                      </p>
                      <p className="text-sm text-text-secondary font-inter">
                        <span className="font-medium">Expires:</span> {credential.expiry}
                      </p>
                    </div>
                    <p className="text-sm text-text-secondary font-inter leading-relaxed">
                      {credential.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance Coverage */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Comprehensive Insurance Protection
          </h3>
          <div className="bg-surface rounded-2xl p-8 border border-border-light">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insuranceCoverage.map((coverage, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon name={coverage.icon} size={24} color="var(--color-success)" />
                  </div>
                  <div>
                    <h4 className="font-inter font-semibold text-text-primary mb-1">{coverage.type}</h4>
                    <p className="text-2xl font-inter font-bold text-success mb-2">{coverage.coverage}</p>
                    <p className="text-sm text-text-secondary font-inter leading-relaxed">
                      {coverage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-border-light text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                <span className="font-inter font-semibold text-success">Certificate of Insurance Available Upon Request</span>
              </div>
              <p className="text-sm text-text-secondary font-inter">
                We provide proof of insurance to all customers before beginning any work on your property.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Associations */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Professional Associations & Recognition
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {associations.map((association, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-border-light text-center hover:shadow-xl transition-smooth">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={association.logo}
                    alt={`${association.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-inter font-semibold text-text-primary mb-2">{association.name}</h4>
                <p className="text-primary font-inter font-medium mb-1">{association.role}</p>
                <p className="text-sm text-text-secondary font-inter">Member since {association.since}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Guarantee */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 pool-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="ShieldCheck" size={32} color="white" />
            </div>
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Your Trust is Our Foundation
            </h3>
            <p className="text-lg text-text-secondary font-inter leading-relaxed mb-6">
              We understand that inviting service professionals into your home requires trust. That's why we maintain the highest standards of licensing, insurance, and professional conduct. Your family's safety and your property's protection are never compromised.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={16} color="var(--color-primary)" />
                <span className="text-sm font-inter font-medium text-text-primary">Verify our credentials: (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} color="var(--color-primary)" />
                <span className="text-sm font-inter font-medium text-text-primary">credentials@poolcrest.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LicensingSection;