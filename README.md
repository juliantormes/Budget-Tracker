# Budget Tracker Project 📊💼

## Overview

Welcome to the **Budget Tracker Project**! This web application provides a streamlined way for individuals to manage their finances by tracking income, expenses, and budget goals. Built with **Python**, **Django**, and **React**, and utilizing **PostgreSQL** as its database, this project is reliable, robust, and production-ready. Both **Railway** and **Docker** are used to facilitate easy deployment, ensuring the app runs consistently across various environments, making it adaptable for any setup.

With features like customizable dashboards, income and expense categorization, credit card management, and calendar views, the Budget Tracker is a comprehensive personal finance tool.

## Key Features

1. **User Authentication**: Secure user registration, login, and account management ensure a personalized, private budgeting experience.
   
2. **Dashboard Overview**: A data-driven dashboard with charts and graphs provides insights into income and spending trends, helping users understand their financial health.

3. **Expense Management**: Users can add, edit, delete, and categorize expenses to track spending patterns and set budget goals effectively.

4. **Income Tracking**: Income logging with categorization allows users to monitor month-over-month income and income sources.

5. **Credit Card Management**: This feature supports credit card transaction tracking, including recurring payments and installment handling, for a complete view of financial obligations.

6. **Calendar Integration**: The calendar view provides a monthly overview, helping users manage income and expenses on specific dates.

7. **Comprehensive Testing**: Both frontend and backend are fully tested, ensuring a stable and reliable user experience across all functionalities.

## Project Structure

### Backend (Django)

- **`models.py`**: Defines core data structures like User, Income, Expense, and CreditCardExpense, capturing user data and transaction details.
  
- **`views.py`**: Handles requests, data validation, and model interactions. Key views include `ExpenseViewSet` and `IncomeViewSet` for CRUD operations.

- **`serializers.py`**: Converts models to JSON and validates incoming data for API responses, especially for recurring payments and installments.

- **`urls.py`**: Configures API endpoint paths, providing a RESTful experience.

- **`tests.py`**: Contains unit tests for models, views, and endpoints to ensure reliability and accurate functionality.

### Frontend (React)

- **`App.js`**: Main component managing routing and page layout, including authentication checks.

- **`components/`**: Reusable components like `ExpenseForm`, `CalendarView`, and `Dashboard`.

- **`hooks/`**: Custom hooks such as `useAuth` for state management and `useMutation` for data operations.

- **`services/`**: Centralized API call logic, simplifying HTTP request management.

- **`tests/`**: Jest tests for component rendering, user interaction, and event handling, ensuring reliability across all user-facing components.

### Database

- **PostgreSQL**: A robust, production-ready database chosen for handling complex queries and scalability.

## Design and Testing Choices

### Docker and Railway Deployment

**Docker** is integrated into the development process to simulate production environments, making it easy to run, test, and deploy the application across different systems. With Docker, the application can be tested in isolated containers, ensuring consistency and helping to catch deployment-specific issues early.

The project is deployed on **Railway** for a seamless, cloud-based experience, ensuring that the app is accessible and consistently running across environments. Both Docker and Railway support highlight the project’s production-readiness, critical for real-world deployments.

### Authentication and Security

Django’s built-in user model is used for authentication, with frontend components safeguarded by authentication checks. The login and registration pages feature a clean, modern design.

### Testing Strategy

Testing is managed with Django’s testing framework for backend and Jest for frontend, ensuring comprehensive validation of functionalities and user interactions. The entire application has been rigorously tested for reliability, covering all core features and user interactions to deliver a seamless, bug-free experience.

### User Interface

Material-UI components ensure a consistent design across pages, and custom styles improve the user experience. The interface is optimized for both responsiveness and accessibility.

### Challenges

- **Recurring Transactions**: Recurring expenses and incomes required flexible updating without altering historical data. This was managed with a `RecurringChangeLog` model.

- **Credit Card Installments**: Distributing installments across future months was achieved through dynamic calculation based on installment periods and surcharges.

## Getting Started

### Prerequisites

- Python 3.10+ (tested on 3.10 and 3.12)
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

6. **Load Initial Data**

    ```bash
    python manage.py loaddata initial_data.json
    ```

    - **Username**: `testuser`
    - **Password**: `123`

7. **Start Development Servers**

    ```bash
    python manage.py runserver  # Django server

    # In another terminal
    cd my_budget_tracker_app
    npm start  # React server
    ```

## Contributing

Contributions are welcome! For feature suggestions or bug fixes, please open a pull request. For significant changes, open an issue to discuss your proposal.

---

Enjoy managing your budget with **Budget Tracker**! 🚀
