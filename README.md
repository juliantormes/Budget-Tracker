# Budget Tracker Project 📊💼

## Overview

Welcome to the **Budget Tracker Project**! This web application simplifies personal finance management, allowing users to track incomes, expenses, and budget goals seamlessly. Built with **Python**, **Django**, and **React**, and powered by **PostgreSQL**, this project is engineered to be both reliable and production-ready. Deployment is managed via **Railway** and **Docker**, making it accessible and adaptable across environments.

With a rich feature set—including customizable dashboards, expense categorization, credit card management, and calendar views—Budget Tracker is designed to empower users in achieving their financial goals.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/xb4Pqe?referralCode=06Olth)


Check out the live app: [Budget Tracker on Railway](https://budget-tracker-production-c5da.up.railway.app/)

---

## Key Features

1. **User Authentication**: Secure registration, login, and account management for a personalized budgeting experience.
   
2. **Dashboard Overview**: A data-driven dashboard with insightful charts and graphs showcasing income and spending trends.

3. **Expense Management**: Enables adding, editing, deleting, and categorizing expenses, allowing users to track spending patterns and set budget goals.

4. **Income Tracking**: Logs income by category, allowing users to monitor sources and month-over-month income growth.

5. **Credit Card Management**: Tracks credit card expenses, including recurring payments and installments, for a comprehensive view of obligations.

6. **Calendar Integration**: Monthly calendar view for managing income and expenses on specific dates.

7. **Comprehensive Testing**: Fully tested frontend and backend, providing a stable, reliable user experience across all functionalities.

---

## Project Structure

### Backend (Django)

- **`models.py`**: Defines core structures like `User`, `Income`, `Expense`, and `CreditCardExpense` to capture user data and transactions.
- **`views.py`**: Handles data processing, validation, and CRUD operations, with key views for `ExpenseViewSet` and `IncomeViewSet`.
- **`serializers.py`**: Converts models to JSON and validates data, particularly for recurring payments and installment handling.
- **`urls.py`**: Configures API endpoint paths to provide a RESTful experience.
- **`tests.py`**: Unit tests for models, views, and endpoints ensure functionality and reliability.

### Frontend (React)

- **`App.js`**: Main component handling routing and layout with authentication checks.
- **`components/`**: Modular components like `ExpenseForm`, `CalendarView`, and `Dashboard` for reuse.
- **`hooks/`**: Custom hooks such as `useAuth` for state management and `useMutation` for data handling.
- **`services/`**: API logic is centralized here, simplifying HTTP requests.
- **`tests/`**: Jest tests for component rendering, user interactions, and event handling to guarantee consistent user experience.

### Database

- **PostgreSQL**: A robust, scalable database solution suitable for handling complex queries.

---

## Design and Testing Choices

### Docker and Railway Deployment

Using **Docker**, the project runs in isolated containers, ensuring stability and making it easier to catch deployment-specific issues early on. **Railway** offers seamless, cloud-based deployment, enabling production-ready hosting and accessibility across all environments.

### Authentication and Security

Django’s authentication is paired with frontend checks to secure sensitive areas. Clean, modern designs for the login and registration pages enhance usability.

### Testing Strategy

The project is fully tested using Django’s testing framework for the backend and Jest for the frontend. Rigorous testing covers all functionalities to ensure a reliable and bug-free experience.

### User Interface

Material-UI provides a cohesive design language, while custom styles improve responsiveness and accessibility, making the app intuitive and appealing.

### Challenges

- **Recurring Transactions**: A `RecurringChangeLog` model enables flexible updates to recurring incomes/expenses without altering historical data.
- **Credit Card Installments**: Dynamic calculation ensures accurate installment distribution across future months based on installment periods and surcharges.

---

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

---

## Contributing

Contributions are welcome! For feature suggestions or bug fixes, please open a pull request. For significant changes, open an issue to discuss your proposal.

## License

This project is licensed under the MIT License.

---

Happy budgeting with **Budget Tracker**! 🚀
