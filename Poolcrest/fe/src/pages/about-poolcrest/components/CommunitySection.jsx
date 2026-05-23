import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const CommunitySection = () => {
  const communityInitiatives = [
    {
      id: 1,
      title: "Annual Pool Safety Education Day",
      description: "Free community event teaching families about pool safety, CPR basics, and proper chemical handling. Over 500 families attended last year.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      impact: "500+ Families Educated",
      date: "Every June",
      icon: "GraduationCap"
    },
    {
      id: 2,
      title: "Free Pool Safety Inspections",
      description: "Complimentary safety inspections for families with young children, including fence checks, drain covers, and emergency equipment assessment.",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      impact: "200+ Homes Inspected",
      date: "Year-round",
      icon: "Shield"
    },
    {
      id: 3,
      title: "Local School Partnership",
      description: "Educational presentations at elementary schools about water safety, teaching children the importance of adult supervision and pool rules.",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      impact: "12 Schools Reached",
      date: "Spring Semester",
      icon: "School"
    },
    {
      id: 4,
      title: "Emergency Pool Rescue Training",
      description: "Free CPR and water rescue training sessions for parents and caregivers, conducted by certified instructors in partnership with local fire department.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      impact: "150+ Adults Trained",
      date: "Monthly Sessions",
      icon: "Heart"
    }
  ];

  const partnerships = [
    {
      name: "Local Fire Department",
      partnership: "Water Safety Education",
      description: "Joint training programs and emergency response protocols",
      logo: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Children\'s Hospital",
      partnership: "Drowning Prevention",
      description: "Supporting hospital\'s drowning prevention awareness campaigns",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Neighborhood Association",
      partnership: "Community Events",
      description: "Sponsoring family-friendly community gatherings and safety fairs",
      logo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
    }
  ];

  const awards = [
    {
      year: "2023",
      title: "Community Safety Champion",
      issuer: "City Council",
      description: "Recognized for outstanding contribution to community pool safety education"
    },
    {
      year: "2022",
      title: "Small Business Excellence Award",
      issuer: "Chamber of Commerce",
      description: "Honored for exceptional customer service and community involvement"
    },
    {
      year: "2021",
      title: "Family Safety Advocate",
      issuer: "Local Parent Association",
      description: "Acknowledged for dedication to child safety and family education"
    }
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 pool-gradient rounded-lg flex items-center justify-center">
              <Icon name="Heart" size={20} color="white" />
            </div>
            <span className="text-accent font-inter font-semibold text-lg">Community Impact</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-inter font-bold text-text-primary mb-4">
            Giving Back to Our Community
          </h2>
          <p className="text-xl text-text-secondary font-inter max-w-3xl mx-auto leading-relaxed">
            We believe in strengthening our community through education, safety initiatives, and partnerships. 
            Your pool service supports local families and safety programs.
          </p>
        </div>

        {/* Community Initiatives */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Our Community Initiatives
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {communityInitiatives.map((initiative) => (
              <div key={initiative.id} className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden hover:shadow-xl transition-smooth">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={initiative.image}
                    alt={initiative.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Icon name={initiative.icon} size={16} color="white" />
                      </div>
                      <span className="text-sm font-inter font-medium">{initiative.date}</span>
                    </div>
                    <h4 className="text-lg font-inter font-bold">{initiative.title}</h4>
                  </div>
                  <div className="absolute top-4 right-4 bg-accent text-white text-sm font-inter font-semibold px-3 py-1 rounded-full">
                    {initiative.impact}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary font-inter leading-relaxed">
                    {initiative.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Partnerships */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Community Partnerships
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {partnerships.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-border-light text-center hover:shadow-xl transition-smooth">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-inter font-semibold text-text-primary mb-2">{partner.name}</h4>
                <p className="text-primary font-inter font-medium mb-2">{partner.partnership}</p>
                <p className="text-sm text-text-secondary font-inter leading-relaxed">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="mb-16">
          <h3 className="text-2xl font-inter font-bold text-text-primary mb-8 text-center">
            Awards & Recognition
          </h3>
          <div className="space-y-4">
            {awards.map((award, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-border-light hover:shadow-xl transition-smooth">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-warning rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Award" size={24} color="white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-inter font-semibold text-text-primary">{award.title}</h4>
                      <span className="bg-accent-100 text-accent text-sm font-inter font-medium px-2 py-1 rounded-md">
                        {award.year}
                      </span>
                    </div>
                    <p className="text-sm text-primary font-inter font-medium mb-1">
                      Awarded by: {award.issuer}
                    </p>
                    <p className="text-sm text-text-secondary font-inter leading-relaxed">
                      {award.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Impact Stats */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-inter font-bold text-text-primary mb-4">
              Our Community Impact by the Numbers
            </h3>
            <p className="text-text-secondary font-inter leading-relaxed">
              Every service call supports our community safety initiatives and educational programs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-inter font-bold text-primary mb-2">850+</div>
              <div className="text-sm text-text-secondary font-inter">Families Educated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-inter font-bold text-primary mb-2">200+</div>
              <div className="text-sm text-text-secondary font-inter">Safety Inspections</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-inter font-bold text-primary mb-2">12</div>
              <div className="text-sm text-text-secondary font-inter">School Partnerships</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-inter font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-text-secondary font-inter">Adults CPR Trained</div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border-light text-center">
            <p className="text-text-secondary font-inter mb-4">
              Want to get involved in our community safety initiatives?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} color="var(--color-primary)" />
                <span className="text-sm font-inter font-medium text-text-primary">community@poolcrest.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={16} color="var(--color-primary)" />
                <span className="text-sm font-inter font-medium text-text-primary">(555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;