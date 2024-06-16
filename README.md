# Budget Tracker Project 📊💼

## Overview

Welcome to the Budget Tracker Project! This application is designed to help individuals manage their finances efficiently and effectively. Built with Python, Django, and React, it uses SQLite for database management. The project aims for a clean architecture with Command Query Responsibility Segregation (CQRS) and comprehensive testing.

## Features

- **User Authentication:** Secure signup, login, and logout functionality for personalized budget tracking.
- **Dashboard:** Visualize your budget and expenses with intuitive charts and graphs.
- **Expense Tracking:** Easily add, edit, or delete expenses and categorize them to keep track of your spending habits.
- **Income Tracking:** Track and categorize your income with ease.
- **Credit Card Management:** Manage credit card expenses, including recurring payments and installments.
- **Responsive Design:** Access your budget tracker on any device, anytime, anywhere.
- **Calendar View:** View incomes and expenses on a calendar for better financial planning.

## Technologies Used

- **Frontend:** React
- **Backend:** Django, Django REST Framework
- **Charts:** Chart.js
- **Database:** SQLite (with plans to incorporate additional free DB options suitable for production)
- **Testing:** PyTest
- **Architecture:** Refactoring towards a clean architecture with CQRS pattern for separation of read and write operations

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js and npm
- Pipenv or virtualenv

### Installation

Follow these steps to get your development environment set up:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/juliantormes/CS50PFinalProject.git
    cd budget_tracker
    ```

2. **Set up the Python virtual environment:**

    ```bash
    # If using pipenv
    pipenv shell  

    # Or using venv
    python -m venv venv
    source venv/bin/activate  # On Unix/macOS
    venv\Scripts\activate  # On Windows
    ```

3. **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4. **Set up the Node.js environment:**

    ```bash
    cd my_budget_tracker_app
    npm install
    ```

5. **Initialize the database:**

    ```bash
    cd ..
    python manage.py migrate
    ```

6. **Run the development servers:**

    ```bash
    # Run Django server
    python manage.py runserver

    # In another terminal, run React development server
    cd my_budget_tracker_app
    npm start
    ```

## Project Status

### Current Tasks

- **Refactor Application:** Refactor the application for a cleaner architecture, ensuring that business logic is cleanly separated from presentation and data access layers.
- **Implement CQRS:** Implement the CQRS pattern to enhance performance and maintainability, making the application more scalable.
- **Testing:** Write and integrate comprehensive tests into a CI pipeline for ongoing quality assurance.

## Contributing

Contributions are welcome! If you have a feature request, bug report, or a pull request, please feel free to contribute. For major changes, please open an issue first to discuss what you would like to change.

## Acknowledgements

Hat tip to everyone who contributed to the tools and libraries we used in this project. We appreciate your support and collaboration.

Thank you for exploring the Budget Tracker Project! 🚀
