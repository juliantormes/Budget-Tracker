# Budget Tracker Project 📊💼

## Overview

Demo: https://youtu.be/VUTgKNDZ66c
Welcome to the **Budget Tracker Project**! This web application helps individuals efficiently manage their finances by offering a user-friendly platform for tracking income, expenses, and budget goals. Designed with a clean and intuitive interface, this tool is built using Python, Django, and React. PostgreSQL serves as the database, providing reliable data management for a production-level experience.

The Budget Tracker provides users with the tools to monitor their financial health visually and effectively. With features like customizable dashboards, income and expense categorization, credit card installment management, and a calendar view, this project is a comprehensive personal finance assistant.

## Key Features

1. **User Authentication**: Users can securely register, log in, and manage their accounts. Each user has a personalized experience, allowing them to securely track their budget over time.

2. **Dashboard Overview**: A visually rich dashboard offers insights into spending and income trends. Charts and graphs, implemented via Chart.js, enable users to quickly grasp their financial status and make informed decisions.

3. **Expense Management**: Users can add, edit, delete, and categorize expenses, making it easy to track spending patterns and adjust budget goals.

4. **Income Tracking**: A streamlined interface allows users to log income sources, categorize them, and review month-over-month income trends.

5. **Credit Card Management**: A specialized feature for managing credit card transactions, including recurring payments and installment handling, gives users an accurate representation of ongoing financial commitments.

6. **Calendar Integration**: A calendar view offers a holistic view of finances, helping users visualize their monthly cash flow and manage both incoming and outgoing funds on specific dates.

7. **Robust Testing**: Both backend and frontend code is thoroughly tested, ensuring a stable, bug-free experience. Testing covers components, views, forms, and database interactions.

## File Structure & Explanation

The project’s main files and directories are organized as follows:

### Backend (Django)

- **`models.py`**: Defines the database models, such as User, Income, Expense, CreditCardExpense, and RecurringChangeLog. These models capture the core data structure, including user data, transaction details, and recurring transaction history.
  
- **`views.py`**: Contains logic for handling incoming requests, validating data, and orchestrating the interactions between models and serializers. Key views include `ExpenseViewSet`, `IncomeViewSet`, and `CreditCardViewSet`, each of which exposes endpoints for CRUD operations.

- **`serializers.py`**: Serializes the data models for API responses, converting complex querysets to JSON and validating incoming data. Custom validation logic, especially for handling installment and recurring payment updates, ensures data integrity.

- **`urls.py`**: Configures URL routing, linking endpoint paths to the corresponding views for a RESTful API experience.

- **`tests.py`**: Implements unit tests using Django’s testing framework, covering models, views, and API endpoints. This file verifies that each feature performs as expected, covering edge cases and validation rules.

### Frontend (React)

- **`App.js`**: The root component that handles overall routing and layout. Contains the logic for rendering pages based on user authentication and role.
  
- **`components/`**: Contains reusable components such as `ExpenseForm`, `IncomeForm`, `CalendarView`, and `Dashboard`. Each component is modular, focusing on a single responsibility, such as rendering the expense input form or displaying the calendar.

- **`hooks/`**: Contains custom hooks like `useAuth` for authentication state management and `useMutation` for handling CRUD operations. This approach keeps the codebase clean and ensures separation of concerns.

- **`services/`**: Centralizes API call logic, reducing redundancy across the frontend by encapsulating HTTP requests in dedicated functions. This directory supports scalability and easier maintenance.

- **`tests/`**: Contains Jest tests for frontend components, ensuring that each component renders correctly, handles user input properly, and triggers expected events.

### Database

- **PostgreSQL** is the primary database for the project, offering robust data handling capabilities to support complex queries and ensure scalability for production environments.

## Design Choices

### Authentication

The authentication system employs Django's built-in user model for backend verification. Frontend components are safeguarded by authentication checks and session persistence, ensuring that users can access their data securely. The login and register pages employ a sleek, Apple-inspired aesthetic with smooth gradient effects, enhancing the user experience.

### Testing Strategy

Testing is conducted using **Django's testing framework** for backend and **Jest** for frontend. Each backend endpoint undergoes unit and integration testing, covering CRUD operations, validation logic, and business rules such as recurring transaction updates. Frontend tests verify that components render as expected and handle user interactions correctly.

### User Interface and Accessibility

The UI is built with responsiveness and accessibility in mind. Material-UI components ensure consistency, while custom styling improves usability across devices. Hover effects, typography choices, and color schemes were thoughtfully designed to make navigation and interaction intuitive.

### Key Design Challenges

- **Recurring Transactions**: Managing recurring expenses and incomes required flexibility for updates and changes over time without affecting historical data. The `RecurringChangeLog` model and `getEffectiveAmount` function were implemented to handle this efficiently.

- **Credit Card Installments**: Handling credit card installments and future transaction distributions across multiple months was achieved by calculating installments and adjusting them based on closing day, surcharges, and installment periods. Past installments are retained for reference, and future installments are distributed correctly across months.

## Getting Started

To set up the development environment, follow these steps:

### Prerequisites

- Python 3.8+
- Node.js and npm
- Pipenv or virtualenv

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/juliantormes/CS50PFinalProject.git
    cd budget_tracker
    ```

2. **Set up Python Virtual Environment**

    ```bash
    # Using pipenv
    pipenv shell  

    # Or using venv
    python -m venv venv
    source venv/bin/activate  # On Unix/macOS
    venv\Scripts\activate  # On Windows
    ```

3. **Install Dependencies**

    ```bash
    pip install -r requirements.txt
    ```

4. **Initialize Node Environment**

    ```bash
    cd my_budget_tracker_app
    npm install
    ```

5. **Run Migrations**

    ```bash
    cd ..
    python manage.py migrate
    ```

6. **Start Development Servers**

    ```bash
    python manage.py runserver  # Django server

    # In another terminal
    cd my_budget_tracker_app
    npm start  # React server
    ```

## Contributing

Your contributions are welcome! Whether it’s feature suggestions, bug fixes, or code improvements, feel free to open a pull request. Please open an issue for significant changes to discuss your proposal before implementation.

## Acknowledgements

Thank you to all contributors and open-source projects that made this application possible. From the Material-UI library to Django REST Framework and Chart.js, your tools and support were invaluable to our success.

Enjoy tracking your budget with the **Budget Tracker Project**! 🚀
