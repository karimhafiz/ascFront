export default function About() {
  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          About Ayendah Sazan
        </h1>
        <p className="text-lg text-gray-700">
          Ayendah Sazan is dedicated to strengthening the community by hosting
          engaging events, workshops, and social gatherings. We aim to empower
          individuals and foster a sense of belonging.
        </p>
      </div>

      {/* What We Do Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-secondary mb-6 text-center">
          What We Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Community Events */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="relative w-full h-64">
              <img
                src="/images/community-events.jpg"
                alt="Community Events"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Community Events
              </h3>
              <p className="text-gray-600">
                We organize events that bring people together, celebrate
                diversity, and promote cultural understanding.
              </p>
            </div>
          </div>

          {/* Workshops */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="relative w-full h-64">
              <img
                src="/images/workshops.jpg"
                alt="Workshops"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Workshops
              </h3>
              <p className="text-gray-600">
                Our workshops focus on skill-building, education, and personal
                development to empower individuals in the community.
              </p>
            </div>
          </div>

          {/* Social Gatherings */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="relative w-full h-64">
              <img
                src="/images/social-gatherings.jpg"
                alt="Social Gatherings"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Social Gatherings
              </h3>
              <p className="text-gray-600">
                We host social gatherings to create opportunities for
                networking, friendship, and collaboration.
              </p>
            </div>
          </div>

          {/* Youth Programs */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="relative w-full h-64">
              <img
                src="/images/youth-programs.jpg"
                alt="Youth Programs"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Youth Programs
              </h3>
              <p className="text-gray-600">
                Our youth programs are designed to inspire and support the next
                generation of leaders in our community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-secondary mb-6">Our Mission</h2>
        <p className="text-lg text-gray-700 mx-auto max-w-3xl">
          At Ayendah Sazan, our mission is to create a vibrant and inclusive
          community where everyone feels valued and supported. We strive to
          empower individuals through education, cultural exchange, and
          meaningful connections.
        </p>
      </div>

      {/* Get Involved Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-secondary mb-6">Get Involved</h2>
        <p className="text-lg text-gray-700 mb-6">
          Join us in making a difference! Whether you want to volunteer, attend
          an event, or support our initiatives, there are many ways to get
          involved with Ayendah Sazan.
        </p>
        <a
          href="/contact"
          className="btn btn-primary px-6 py-3 text-white rounded-lg shadow-md hover:bg-primary-dark"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
