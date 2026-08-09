export const DEFAULT_TEMPLATE = {
  id: 'tekquora-standard-proposal',
  name: 'TekQuora Standard Requirements & Proposal Template',
  version: '1.0',
  branding: {
    title: 'TekQuora Corporate Website & Content Management System (CMS)',
    subtitle: 'Comprehensive Project Requirements & System Specification',
    preparedBy: 'TekQuora',
    preparedFor: 'TekQuora Pvt. Ltd.',
    version: '1.0',
    submittedDate: 'July 2026',
    logoText: 'TekQuora',
    showCoverPage: true
  },
  sections: [
    {
      id: 'sec-1',
      number: '1',
      title: 'Project Overview',
      isFixed: true,
      content: `The TekQuora Corporate Website & Content Management System (CMS) is a modern web application designed to establish a strong digital presence for TekQuora while providing a secure and scalable platform for managing website content. The system combines a professional public-facing corporate website with a custom-built administrative Content Management System (CMS), enabling administrators to manage website content dynamically without requiring any modifications to the application's source code.

The website functions as the official online platform for TekQuora, showcasing the company's services, expertise, completed projects, technical capabilities, work culture, leadership team, and contact information. It serves as both a marketing platform and a lead generation system by allowing prospective clients to submit project inquiries directly through an integrated contact form.

The administrative portal enables authorized users to efficiently manage every section of the website, including homepage banners, company information, services, portfolio projects, team members, image galleries, client inquiries, SEO settings, and system configuration.`,
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
          caption: 'TekQuora Collaborative Engineering & Digital Platform Workspace'
        }
      ],
      urls: [
        {
          id: 'url-1',
          title: 'TekQuora Official Corporate Portal',
          link: 'http://localhost:8085/'
        }
      ]
    },
    {
      id: 'sec-2',
      number: '2',
      title: 'About TekQuora',
      isFixed: true,
      content: `TekQuora is a technology-driven software development company dedicated to delivering innovative digital solutions that help businesses accelerate their digital transformation. The company specializes in designing and developing high-quality web applications, enterprise software solutions, mobile applications, cloud-based systems, artificial intelligence solutions, and user-centric digital experiences.

TekQuora's primary objective is to provide reliable, scalable, and performance-oriented software solutions that solve real-world business challenges. By combining technical expertise with modern development methodologies, the company delivers software products that improve operational efficiency, enhance customer engagement, and support long-term business growth.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-3',
      number: '3',
      title: 'Business Background',
      isFixed: true,
      content: `In today's competitive digital environment, businesses require a strong online presence to establish credibility, communicate their expertise, and attract potential customers. Before the development of this system, TekQuora lacked a centralized and easily manageable platform for presenting its services and updating website content efficiently.

Content modifications required direct changes to application source code, making updates time-consuming and dependent on software developers. This process increased maintenance costs and delayed content publishing. To overcome these challenges, TekQuora initiated the development of a custom Content Management System integrated with a responsive corporate website.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-4',
      number: '4',
      title: 'Project Vision',
      isFixed: true,
      content: `To establish TekQuora as a trusted technology partner by delivering a modern, secure, scalable, and user-friendly corporate website integrated with a powerful Content Management System that enhances customer engagement, strengthens the company's digital presence, and simplifies website administration.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-5',
      number: '5',
      title: 'Project Mission',
      isFixed: true,
      content: `The mission of the TekQuora Corporate Website & CMS is to provide a professional digital platform that enables businesses and clients to understand TekQuora's capabilities while empowering administrators to manage all website content through an intuitive, secure, and efficient administration interface.

The project focuses on delivering an exceptional user experience, maintaining high security standards, ensuring responsive design across devices, and supporting future scalability.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-6',
      number: '6',
      title: 'Project Objectives',
      isFixed: true,
      content: `The primary objectives of the project are:

• Develop a modern and responsive corporate website representing TekQuora's brand identity.
• Design and implement a secure administrator dashboard for content management.
• Enable dynamic management of website content without modifying source code.
• Showcase company services, portfolio projects, work culture, and technical expertise.
• Provide a centralized platform for managing customer inquiries.
• Improve search engine visibility through configurable SEO settings.
• Deliver a scalable and maintainable application following MVC architecture.
• Ensure compatibility across desktop, tablet, and mobile devices.
• Implement secure authentication and authorization mechanisms.
• Reduce long-term website maintenance efforts through an integrated CMS.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-7',
      number: '7',
      title: 'Business Need',
      isFixed: true,
      content: `The project addresses several key business challenges:

• Lack of centralized content management.
• Dependence on developers for routine website updates.
• Limited visibility of company services and portfolio.
• Absence of structured inquiry management.
• Inconsistent branding across website sections.
• Difficulty maintaining dynamic content.
• Need for improved customer engagement.
• Requirement for a scalable platform supporting future enhancements.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-8',
      number: '8',
      title: 'Project Scope',
      isFixed: true,
      content: `In Scope:
The project includes the complete development of the following modules:

Public Website:
• Home Page & Interactive Hero Banner
• About Us Page & Corporate History
• Our Services Showcase
• Work Culture & Employee Value Proposition
• Team Members Directory
• Project Portfolio & Case Studies
• Contact Us Form with Interactive Maps
• Image & Moments Gallery
• Responsive Navigation Header & Global Footer Management

Administration Portal:
• Secure Role-Based Authentication & Dashboard Analytics
• Hero Banner Management & Header Management
• Services, Portfolio, Gallery, Team, and Inquiry Management Modules
• System SEO Configuration & Mail Service Settings

Out of Scope:
• Online Payment Gateway & E-Commerce Shopping Cart
• ERP Integration & Multi-language Localization`,
      images: [],
      urls: []
    },
    {
      id: 'sec-9',
      number: '9',
      title: 'Project Deliverables',
      isFixed: true,
      content: `The project delivers the following core deliverables:

1. Fully Responsive Corporate Website Application
2. Administrative Content Management System (CMS) Dashboard
3. SQLite / MySQL Relational Database Schema & Data Models
4. Contact Inquiry Management & Email Notification System
5. Comprehensive Technical & User Documentation Manuals`,
      images: [],
      urls: []
    },
    {
      id: 'sec-10',
      number: '10',
      title: 'Key Stakeholders',
      isFixed: true,
      content: `The key project stakeholders and their respective responsibilities:`,
      table: {
        headers: ['Stakeholder', 'Responsibility'],
        rows: [
          ['Product Owner', 'Defines business requirements and approves deliverables'],
          ['Project Manager', 'Oversees planning, execution, monitoring, and delivery'],
          ['UI/UX Designer', 'Designs the user interface and user experience'],
          ['Software Developers', 'Develop frontend, backend, and CMS modules'],
          ['QA Engineer', 'Conducts testing and quality assurance'],
          ['Administrator', 'Manages website content through the CMS'],
          ['Visitors & Clients', 'Browse website services, portfolio, and submit inquiries']
        ]
      },
      images: [],
      urls: []
    },
    {
      id: 'sec-11',
      number: '11',
      title: 'Success Criteria',
      isFixed: true,
      content: `The project will be considered successful when:

• All planned website pages are fully functional and responsive.
• The CMS enables administrators to update all website content without code changes.
• Customer inquiries are stored successfully and email notifications are dispatched.
• Responsive layouts function flawlessly across desktop, tablet, and mobile viewports.
• Authentication mechanisms effectively prevent unauthorized administrative access.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-12',
      number: '12',
      title: 'Project Constraints',
      isFixed: true,
      content: `• Fixed project timeline and milestone delivery dates.
• Limited development resources and allocated budget.
• Browser compatibility requirements across major modern browsers.
• External SMTP dependency for email notifications.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-13',
      number: '13',
      title: 'Project Assumptions',
      isFixed: true,
      content: `• All project requirements are approved before development phase.
• Hosting infrastructure supports Node / PHP environment.
• Client provides official branding assets, logos, and initial copy.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-14',
      number: '14',
      title: 'High-Level Risks',
      isFixed: true,
      content: `Identified risks and mitigation strategies:`,
      table: {
        headers: ['Risk', 'Impact', 'Mitigation Strategy'],
        rows: [
          ['Requirement changes', 'High', 'Formal change management process'],
          ['Server failure', 'High', 'Regular automated backups and monitoring'],
          ['Security vulnerabilities', 'High', 'Security updates & role middleware'],
          ['Data loss', 'High', 'Automated database snapshots'],
          ['Email delivery issues', 'Medium', 'SMTP monitoring & retry queue handling'],
          ['Performance degradation', 'Medium', 'Code optimization & asset caching']
        ]
      },
      images: [],
      urls: []
    },
    {
      id: 'sec-15',
      number: '15',
      title: 'High-Level Timeline',
      isFixed: true,
      content: `Project implementation phases and milestones:`,
      table: {
        headers: ['Phase', 'Description'],
        rows: [
          ['Planning', 'Project initiation and requirement gathering'],
          ['Analysis', 'Business and functional analysis'],
          ['Design', 'UI/UX wireframing and architecture design'],
          ['Development', 'Frontend, Backend, and CMS implementation'],
          ['Testing', 'Functional, integration, and user acceptance testing'],
          ['Deployment', 'Production environment deployment & launch'],
          ['Maintenance', 'Ongoing support, updates, and enhancements']
        ]
      },
      images: [],
      urls: []
    },
    {
      id: 'sec-16',
      number: '16',
      title: 'Technology Stack',
      isFixed: true,
      content: `Technical stack specifications for the system:`,
      table: {
        headers: ['Layer', 'Technology'],
        rows: [
          ['Frontend UI', 'React / HTML5, CSS3, JavaScript ES6+'],
          ['Styling & Layout', 'Tailwind CSS, Word Document Canvas CSS'],
          ['Build & Dev Tool', 'Vite Fast Module Bundler'],
          ['Database Storage', 'SQLite / LocalStorage State Sync'],
          ['Authentication', 'Role-Based Authentication (Admin vs Standard User)'],
          ['Export Engine', 'Browser Print / PDF Generator Engine']
        ]
      },
      images: [],
      urls: []
    },
    {
      id: 'sec-17',
      number: '17',
      title: 'Home Page – Landing Page',
      isFixed: true,
      content: `Overview
The Home page serves as the primary landing page of the TekQuora Corporate Website. It introduces visitors to the company's vision, services, achievements, projects, work culture, and contact information through a structured and visually engaging interface.

The page has been designed to create a strong first impression while guiding visitors toward exploring the company's services and portfolio.

Key Features
• Fully responsive navigation bar
• Dynamic hero banner
• Company overview
• Services overview
• Featured projects
• Work culture section
• Client statistics
• Gallery preview
• Contact section
• Professional footer`,
      images: [
        {
          id: 'img-17',
          url: '/pdf_images/page_9.png',
          caption: 'Home Page & Dynamic Hero Banner Interface'
        }
      ],
      urls: []
    },
    {
      id: 'sec-18',
      number: '18',
      title: 'Hero Section',
      isFixed: true,
      content: `Purpose
The Hero Section is the first section displayed to visitors after loading the website. It immediately communicates TekQuora's vision and core business offerings through impactful visuals and compelling messaging.

Components

Navigation Header
The top navigation bar provides quick access to all major sections of the website, including:
• Home
• About
• Our Team
• Our Services
• Projects
• Contact
The company logo is positioned on the left side of the header, reinforcing brand identity, while the navigation menu enables users to move seamlessly between pages.

Hero Banner
The hero banner contains the primary marketing message of the organization.

Headline
Future-Ready Technology Solutions
This headline emphasizes TekQuora's commitment to delivering innovative, scalable, and future-oriented digital solutions.

Supporting Description
A concise introductory paragraph highlights the company's expertise in:
• Web Development
• Artificial Intelligence
• Digital Transformation
• Enterprise Solutions
• Modern Software Development

Background Image
A high-quality workplace photograph showcases TekQuora's collaborative office environment, providing visitors with a visual representation of the company's professional culture and team-oriented approach.

Purpose of the Hero Section
The Hero Section aims to:
• Capture visitor attention immediately.
• Present the company's core value proposition.
• Strengthen brand credibility.
• Encourage users to continue exploring the website.`,
      images: [
        {
          id: 'img-18',
          url: '/pdf_images/page_10.png',
          caption: 'Hero Section Architecture & Marketing Messaging'
        }
      ],
      urls: []
    },
    {
      id: 'sec-19',
      number: '19',
      title: 'About TekQuora Section',
      isFixed: true,
      content: `Overview
The About TekQuora section introduces visitors to the company by providing a concise overview of its mission, expertise, and business philosophy.
It communicates the organization's commitment to delivering reliable, scalable, and innovative software solutions that support business growth.

Company Overview
This section explains that TekQuora is a technology-driven software company focused on developing:
• Enterprise Web Applications
• Mobile Applications
• Artificial Intelligence Solutions
• Cloud-Based Systems
• Custom Software Products
The content highlights the company's emphasis on quality, innovation, customer satisfaction, and long-term client relationships.

Company Highlights
The section includes statistical achievements presented through visually attractive information cards.
These include:
• 10+ Years of Industry Experience
• 500+ Projects Successfully Delivered
• 6,500+ Satisfied Clients Worldwide
• 30+ Countries Served
These metrics strengthen credibility and demonstrate TekQuora's industry experience and global reach.`,
      images: [
        {
          id: 'img-19-1',
          url: '/pdf_images/page_12.png',
          caption: 'About TekQuora Overview & Achievements Interface'
        },
        {
          id: 'img-19-2',
          url: '/pdf_images/page_13.png',
          caption: 'Core Values & Why Choose TekQuora Diagram'
        }
      ],
      urls: []
    },
    {
      id: 'sec-20',
      number: '20',
      title: 'Our Services Section',
      isFixed: true,
      content: `Overview
The Services section provides an overview of the company's primary business offerings. Each service is presented using an icon, title, and concise description, allowing visitors to quickly understand TekQuora's technical capabilities.

Services Offered

Web Development
Design and development of scalable, secure, and responsive web applications using modern technologies and industry best practices.

Mobile Solutions
Development of native and cross-platform mobile applications for Android and iOS platforms with seamless user experiences.

Artificial Intelligence & Machine Learning
Implementation of AI-powered solutions including automation, predictive analytics, machine learning models, and intelligent business applications.

IoT Solutions
Development of Internet of Things (IoT) platforms enabling connected devices, real-time monitoring, data collection, and intelligent automation.

Purpose
This section enables potential clients to understand the breadth of TekQuora's technical expertise while encouraging further exploration of individual services.`,
      images: [
        {
          id: 'img-20-1',
          url: '/pdf_images/page_14.png',
          caption: 'Our Services Cards & Team Innovation Details'
        },
        {
          id: 'img-20-2',
          url: '/pdf_images/page_15.png',
          caption: 'Employee Growth & Global Reach Infographic'
        }
      ],
      urls: []
    },
    {
      id: 'sec-21',
      number: '21',
      title: 'Work Culture Section',
      isFixed: true,
      content: `Overview
The Work Culture section reflects the organization's internal environment and values, demonstrating TekQuora's commitment to employee development, teamwork, innovation, and continuous learning.

Key Highlights
The section showcases:
• Collaborative Team Environment
• Knowledge Sharing
• Continuous Learning
• Employee Well-being
• Professional Development
• Innovation-Driven Culture

Images from the workplace provide an authentic representation of daily operations and organizational culture.

Purpose
This section helps prospective employees, partners, and clients understand the company's values and workplace philosophy.`,
      images: [
        {
          id: 'img-21',
          url: '/pdf_images/page_16.png',
          caption: 'Work Culture Highlights & Office Workplace Environment'
        }
      ],
      urls: []
    },
    {
      id: 'sec-22',
      number: '22',
      title: 'Projects Showcase',
      isFixed: true,
      content: `Overview
The Projects section highlights TekQuora's completed software solutions and successful client engagements.
Projects are displayed using professional project cards containing:
• Project Thumbnail
• Project Name
• Technology Category
• Brief Description
• Technology Stack
• Project Classification

Sample Projects
• TVK Tiruchengodu Digital Portal
• MCC IGH
• Conference Management System
• MCC AI Language Platform
• EchoScribe AI
• Student Portal Mobile Application

Purpose
The Projects page demonstrates TekQuora's technical expertise and provides visitors with examples of completed solutions across multiple domains.`,
      images: [
        {
          id: 'img-22',
          url: '/pdf_images/page_18.png',
          caption: 'Projects Showcase Grid & Technology Stack'
        }
      ],
      urls: []
    },
    {
      id: 'sec-23',
      number: '23',
      title: 'Team Section',
      isFixed: true,
      content: `Overview
The Team page introduces the professionals responsible for delivering TekQuora's software solutions.
Each team profile includes:
• Professional Photograph
• Employee Name
• Designation
• Department
• Office Location
• Role Category

The page highlights leadership, software developers, HR professionals, digital marketing executives, interns, and other organizational members.

Purpose
The Team page establishes transparency, builds trust with clients, and showcases the expertise of the organization's workforce.`,
      images: [
        {
          id: 'img-23',
          url: '/pdf_images/page_19.png',
          caption: 'Meet Our Team Directory & Profiles'
        }
      ],
      urls: []
    },
    {
      id: 'sec-24',
      number: '24',
      title: 'Contact Us Section',
      isFixed: true,
      content: `Overview
The Contact page provides visitors with multiple channels for communicating with TekQuora.
The section contains a fully functional inquiry form integrated with the application's backend.

Contact Form Fields
• Full Name
• Email Address
• Company Name
• Project Type / Service
• Project Details / Message

Form Processing
Upon submission:
1. User input is validated.
2. Inquiry details are stored securely in the database.
3. An email notification is sent to the administrator.
4. The inquiry becomes available in the Admin CMS under the Inquiries module.

Additional Contact Information
The page also displays:
• Office Address
• Official Email Address
• Contact Number
• Interactive Google Map

This allows clients to connect with the company through multiple communication channels.`,
      images: [
        {
          id: 'img-24',
          url: '/pdf_images/page_21.png',
          caption: 'Contact Us Form & Head Office Location Details'
        }
      ],
      urls: []
    },
    {
      id: 'sec-25',
      number: '25',
      title: 'Footer Section',
      isFixed: true,
      content: `Overview
The Footer is displayed consistently across all pages and provides quick access to essential information.

Footer Components
• Company Description
• Navigation Links
• Service Links
• Company Pages
• Resources
• Contact Information
• Social Media Links
• Copyright Notice
• Privacy Policy
• Terms of Service

Purpose
The Footer enhances website usability by providing visitors with quick navigation options and important organizational information.`,
      images: [
        {
          id: 'img-25',
          url: '/pdf_images/page_22.png',
          caption: 'Global Website Footer & Social Media Links'
        }
      ],
      urls: []
    },
    {
      id: 'sec-26',
      number: '26',
      title: 'Overall Website Features',
      isFixed: true,
      content: `The TekQuora Corporate Website incorporates several features that contribute to a professional user experience:

• Fully responsive design for desktop, tablet, and mobile devices.
• Dynamic content managed through the Admin CMS.
• Secure inquiry submission with server-side validation.
• Professional corporate branding and modern UI/UX.
• Portfolio showcase with categorized project listings.
• Team directory with structured profile information.
• Integrated Google Maps and contact details.
• SEO-ready architecture and configurable metadata.
• Fast page loading with optimized Laravel and Vite assets.
• Secure authentication and content management for administrators.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-27',
      number: '27',
      title: 'TekQuora Administration Portal (Content Management System)',
      isFixed: true,
      content: `Introduction
The TekQuora Administration Portal is a secure and centralized Content Management System (CMS) developed to simplify the management of the TekQuora Corporate Website. Built using the Laravel Framework, the CMS enables authorized administrators to manage every aspect of the website through an intuitive web interface without modifying the application's source code.

The administration portal provides complete control over website content, including homepage banners, company information, services, portfolio projects, team members, work culture, gallery images, customer inquiries, footer content, and system configuration. By offering dedicated management modules, the CMS ensures that website content remains accurate, up-to-date, and consistent while significantly reducing maintenance effort.

The system is protected using Laravel's authentication and middleware mechanisms, ensuring that only authorized users can access administrative functions.`,
      images: [],
      urls: []
    },
    {
      id: 'sec-28',
      number: '28',
      title: 'Administrator Login',
      isFixed: true,
      content: `The administration portal is accessible only to authenticated users through a secure login page.

Login URL
http://127.0.0.1:8000/admin/login

Administrator Credentials:`,
      table: {
        headers: ['Field', 'Value'],
        rows: [
          ['Email Address', 'admin@tekquora.com'],
          ['Password', 'Admin12']
        ]
      },
      images: [
        {
          id: 'img-28',
          url: '/pdf_images/page_24.png',
          caption: 'Administrator Secure Login Portal Interface'
        }
      ],
      urls: []
    },
    {
      id: 'sec-29',
      number: '29',
      title: 'Administrator Dashboard',
      isFixed: true,
      content: `The Dashboard serves as the central management interface of the TekQuora CMS. It provides administrators with a real-time overview of website activities, project statistics, customer inquiries, and system status immediately after login.

The dashboard presents important information through interactive summary cards and quick-access panels, allowing administrators to efficiently monitor website performance and manage daily operations.

Dashboard Features
• Website overview and analytics
• Active projects count
• Open customer inquiries
• Resolved inquiry statistics
• Total leads captured
• Recent customer messages
• Website module status
• Quick navigation to management modules

The dashboard acts as the primary control centre from which administrators can access all other content management modules.`,
      images: [
        {
          id: 'img-29',
          url: '/pdf_images/page_25.png',
          caption: 'Administrator Dashboard Analytics & Overview Interface'
        }
      ],
      urls: []
    },
    {
      id: 'sec-30',
      number: '30',
      title: 'Header Management',
      isFixed: true,
      content: `The Header Management module controls the website's branding and navigation menu. It enables administrators to modify the website header dynamically without editing source code.

Administrators can upload company logos, configure navigation menu labels, and update navigation links displayed across the website.

Managed Components
• Company Logo
• Navigation Menu
• Menu Labels
• Navigation Links
• Header Display Settings

Changes made within this module are immediately reflected throughout the website.`,
      images: [
        {
          id: 'img-30',
          url: '/pdf_images/page_26.png',
          caption: 'Header & Navigation Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-31',
      number: '31',
      title: 'About Page Management',
      isFixed: true,
      content: `The About Page Management module allows administrators to update company information presented on the About Us page.

This module includes management of the company's history, mission, vision, values, milestones, and supporting images.

Editable Sections
• Company Overview
• Company History
• Vision Statement
• Mission Statement
• Core Values
• Timeline
• About Images

Maintaining this information through the CMS ensures that company details remain current and professionally presented.`,
      images: [
        {
          id: 'img-31',
          url: '/pdf_images/page_27.png',
          caption: 'About Section Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-32',
      number: '32',
      title: 'Services Management',
      isFixed: true,
      content: `The Services Management module is responsible for maintaining all services offered by TekQuora.
Administrators can create, modify, and remove service cards displayed on the public website.

Service Information
Each service includes:
• Service Title
• Icon
• Category
• Description
• Display Order

Sample Services
• Web Development
• Mobile Application Development
• Artificial Intelligence
• Cloud Computing
• UI/UX Design
• Custom Software Development

This module provides flexibility for expanding or modifying service offerings as the business evolves.`,
      images: [
        {
          id: 'img-32',
          url: '/pdf_images/page_28.png',
          caption: 'Services Management & Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-33',
      number: '33',
      title: 'Work Culture Management',
      isFixed: true,
      content: `The Work Culture Management module enables administrators to manage content related to TekQuora's organizational culture and employee experience .The module highlights the company's collaborative work environment, professional growth opportunities, employee benefits, and recruitment initiatives.

Managed Content
• Work Culture
• Employee Benefits
• Career Opportunities
• Why Join Us
• Company Values

This content supports employer branding and helps attract potential employees.`,
      images: [
        {
          id: 'img-33',
          url: '/pdf_images/page_29.png',
          caption: 'Work Culture Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-34',
      number: '34',
      title: 'Moments Gallery Management',
      isFixed: true,
      content: `The Moments Gallery Management module allows administrators to maintain image galleries displayed throughout the website.

Images representing company events, office activities, celebrations, workshops, and team-building sessions can be uploaded, organized, and removed using this module.

Features
• Upload Multiple Images
• Delete Images
• Organize Gallery
• Preview Images
• Manage Display Order

The gallery enhances the visual appeal of the website while showcasing the company's culture and achievements.`,
      images: [
        {
          id: 'img-34',
          url: '/pdf_images/page_30.png',
          caption: 'Moments Gallery Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-35',
      number: '35',
      title: 'Team Management',
      isFixed: true,
      content: `The Team Management module allows administrators to maintain employee profiles displayed on the Team page.

Administrators can add new team members, update profile information, upload photographs, assign job titles, and include professional social media links.

Team Information
Each profile includes:
• Employee Name
• Designation
• Department
• Biography
• Profile Photograph
• LinkedIn Profile
• GitHub Profile
• Email Address

Keeping employee information updated improves transparency and strengthens the company's professional image.`,
      images: [
        {
          id: 'img-35',
          url: '/pdf_images/page_31.png',
          caption: 'Meet Our Team Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-36',
      number: '36',
      title: 'Footer Management',
      isFixed: true,
      content: `The Footer Management module controls the global footer displayed across every page of the website.
Administrators can update company contact information, quick navigation links, social media profiles, copyright text, and legal information.

Editable Components
• Company Description
• Contact Information
• Phone Numbers
• Email Addresses
• Quick Links
• Social Media Links
• Copyright Notice

This centralized management ensures consistency throughout the website.`,
      images: [
        {
          id: 'img-36',
          url: '/pdf_images/page_32.png',
          caption: 'Website Footer Configuration Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-37',
      number: '37',
      title: 'System Configuration',
      isFixed: true,
      content: `The System Configuration module contains global application settings affecting the entire website.
Administrators can configure SEO metadata, SMTP email settings, analytics integration, maintenance mode, and general website information.

Configuration Options
• Website Name
• SEO Meta Title
• Meta Description
• SMTP Configuration
• Google Analytics
• Maintenance Mode
• Contact Information
• System Settings

Centralized configuration simplifies administration while ensuring consistent system behaviour across all modules.`,
      images: [
        {
          id: 'img-37',
          url: '/pdf_images/page_33.png',
          caption: 'System Configuration & Mail Settings Module'
        }
      ],
      urls: []
    },
    {
      id: 'sec-38',
      number: '38',
      title: 'Summary',
      isFixed: true,
      content: `The TekQuora Corporate Website successfully combines a visually engaging corporate presence with a powerful Laravel-based Content Management System. It enables visitors to explore the company's services, projects, team, and work culture while providing administrators with a centralized platform to manage all website content dynamically. Through its responsive design, structured navigation, inquiry management system, and scalable architecture, the application delivers a professional digital experience that supports TekQuora's business objectives and strengthens its online presence.`,
      images: [],
      urls: []
    }
  ]
};
