# CS50P Final Project: Budget Tracker Project 📊💼

## Overview

Welcome to the Budget Tracker Project! This application is designed to help individuals manage their finances efficiently and effectively. Built with Python and Django, it uses SQLite for database management and is poised for future enhancements with Command Query Responsibility Segregation (CQRS) and comprehensive testing.

## Features

- **User Authentication:** Secure signup and login functionality for personalized budget tracking.
- **Dashboard:** Visualize your budget and expenses with intuitive charts and graphs.
- **Expense Tracking:** Easily add, edit, or delete expenses and categorize them to keep track of your spending habits.
- **Budget Planning:** Set monthly budget goals and compare them with your actual spending. (NOT YET)
- **Responsive Design:** Access your budget tracker on any device, anytime, anywhere.

## Technologies Used

- **Frontend:** Django
- **Charts:** Chart.js
- **Database:** SQLite (with plans to incorporate additional free DB options suitable for production)
- **Testing:** Integration with PyTest pending
- **Architecture:** Refactoring towards a clean architecture with CQRS pattern for separation of read and write operations

## Getting Started

### Prerequisites

- Python 3.8+
- Pipenv or virtualenv

### Installation

Follow these steps to get your development environment set up:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/budget-tracker.git
   cd budget-tracker
   
   # If using pipenv
   pipenv shell  

   # Or using venv
   python -m venv venv
   source venv/bin/activate  # On Unix/macOS
   source venv/Scripts/activate  # On Windows

2. **Install dependencies:**
    ```bash
   pip install -r requirements.txt

3. **Initialize the database:**
    ```bash
   python manage.py migrate
    
4. **Run the server:**
    ```bash
   python manage.py runserver

## Project Status

### Current Tasks

- **Refactor Application:** Our first priority is to refactor the application for a cleaner architecture, ensuring that business logic is cleanly separated from presentation and data access layers.
  
- **Implement CQRS:** We plan to implement the CQRS pattern to enhance performance and maintainability, making the application more scalable.
  
- **Testing:** Comprehensive tests will be written and integrated into a CI pipeline for ongoing quality assurance.

## Contributing

Contributions are welcome! If you have a feature request, bug report, or a pull request, please feel free to contribute. For major changes, please open an issue first to discuss what you would like to change.


## Acknowledgements

Hat tip to everyone who contributed to the tools and libraries we used in this project. We appreciate your support and collaboration.

Thank you for exploring the Budget Tracker Project! 🚀

