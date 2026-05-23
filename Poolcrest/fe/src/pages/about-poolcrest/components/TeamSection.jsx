import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamSection = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Michael Rodriguez",
      role: "Founder & Lead Pool Technician",
      experience: "15+ years",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
      bio: "Started Poolcrest with a vision to transform pool maintenance from a chore into peace of mind. Father of three who understands the importance of safe, clean pools for family enjoyment.",
      certifications: ["CPO Certified", "NSPF Certified", "EPA Licensed"],
      specialties: ["Pool Chemistry", "Equipment Repair", "Safety Systems"],
      personalNote: "Pool owner for 12 years, loves weekend BBQs by the pool with family"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Senior Pool Specialist & Safety Coordinator",
      experience: "12+ years",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
      bio: "Expert in pool safety systems and family-friendly maintenance solutions. Passionate about educating families on proper pool safety and chemical handling.",
      certifications: ["Pool Safety Inspector", "Chemical Safety Certified", "First Aid/CPR"],
      specialties: ["Safety Inspections", "Family Education", "Chemical Balance"],
      personalNote: "Mother of two, advocates for child pool safety in the community"
    },
    {
      id: 3,
      name: "David Thompson",
      role: "Equipment Specialist & Emergency Response",
      experience: "10+ years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
      bio: "Mechanical engineer turned pool equipment expert. Specializes in diagnosing complex equipment issues and implementing energy-efficient solutions.",
      certifications: ["Mechanical Engineering", "Pool Equipment Certified", "Energy Efficiency Specialist"],
      specialties: ["Equipment Diagnostics", "Energy Solutions", "Emergency Repairs"],
      personalNote: "Tech enthusiast who loves integrating smart technology with traditional pool care"
    },
    {
      id: 4,
      name: "Lisa Martinez",
      role: "Customer Success & Community Outreach",
      experience: "8+ years",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
      bio: "Dedicated to ensuring every customer feels heard and valued. Coordinates community pool safety events and manages customer relationships with genuine care.",
      certifications: ["Customer Service Excellence", "Community Outreach Certified", "Pool Safety Advocate"],
      specialties: ["Customer Relations", "Community Events", "Service Coordination"],
      personalNote: "Organizes annual community pool safety workshops and family fun days"
    }
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 pool-gradient rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} color="white" />
            </div>
            <span className="text-accent font-inter font-semibold text-lg">Our Team</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Meet Your Pool Care Experts
          </h2>
          <p className="text-xl text-text-secondary font-inter max-w-3xl mx-auto leading-relaxed">
            Our team combines technical expertise with genuine care for your family's safety and enjoyment. We're not just pool professionals – we're your neighbors who happen to be pool experts.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden hover:shadow-xl transition-smooth">
              {/* Member Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={member.image}
                  alt={`${member.name} - ${member.role}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-inter font-bold">{member.name}</h3>
                  <p className="text-sm opacity-90">{member.role}</p>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-sm font-inter font-semibold text-primary">{member.experience}</span>
                </div>
              </div>

              {/* Member Info */}
              <div className="p-6 space-y-4">
                <p className="text-text-secondary font-inter leading-relaxed text-sm">
                  {member.bio}
                </p>

                {/* Certifications */}
                <div className="space-y-2">
                  <h4 className="text-sm font-inter font-semibold text-text-primary">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.certifications.map((cert, index) => (
                      <span key={index} className="bg-primary-50 text-primary text-xs font-inter font-medium px-2 py-1 rounded-md">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <h4 className="text-sm font-inter font-semibold text-text-primary">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, index) => (
                      <span key={index} className="bg-accent-50 text-accent text-xs font-inter font-medium px-2 py-1 rounded-md">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personal Note */}
                <div className="bg-surface rounded-lg p-3 border-l-4 border-primary">
                  <div className="flex items-start space-x-2">
                    <Icon name="Heart" size={16} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-text-secondary font-inter italic">
                      {member.personalNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Values */}
        <div className="bg-white rounded-2xl shadow-lg border border-border-light p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              What Drives Our Team
            </h3>
            <p className="text-text-secondary font-inter leading-relaxed">
              Every team member shares our core commitment to family safety, technical excellence, and community care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="GraduationCap" size={24} color="var(--color-primary)" />
              </div>
              <h4 className="font-inter font-semibold text-text-primary">Continuous Learning</h4>
              <p className="text-sm text-text-secondary font-inter">
                Regular training and certification updates to stay current with industry best practices.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Users" size={24} color="var(--color-accent)" />
              </div>
              <h4 className="font-inter font-semibold text-text-primary">Community Focus</h4>
              <p className="text-sm text-text-secondary font-inter">
                Active involvement in local pool safety education and community events.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Shield" size={24} color="var(--color-success)" />
              </div>
              <h4 className="font-inter font-semibold text-text-primary">Safety First</h4>
              <p className="text-sm text-text-secondary font-inter">
                Every service prioritizes family safety and proper chemical handling procedures.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Heart" size={24} color="var(--color-secondary)" />
              </div>
              <h4 className="font-inter font-semibold text-text-primary">Genuine Care</h4>
              <p className="text-sm text-text-secondary font-inter">
                We treat every pool like it belongs to our own family because that's how we see our customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;