# CS50P Final Project: Budget Tracker Project 📊💼

## Overview

Welcome to the Budget Tracker Project! This application is designed to help individuals manage their finances efficiently and effectively. Built with Python and Django for the frontend, it uses SQLite for database management. The project also includes comprehensive tests using PyTest and demonstrates consuming external APIs for enhanced functionalities.

## Features

- **User Authentication:** Secure signup and login functionality for personalized budget tracking.
- **Dashboard:** Visualize your budget and expenses with intuitive charts and graphs.
- **Expense Tracking:** Easily add, edit, or delete expenses and categorize them to keep track of your spending habits.
- **Budget Planning:** Set monthly budget goals and compare them with your actual spending.
- **API Integration:** Fetch real-time financial data and insights to aid in better budget management.
- **Responsive Design:** Access your budget tracker on any device, anytime, anywhere.

## Technologies Used

- **Frontend:** Django
- **Database:** SQLite
- **Testing:** PyTest
- **API Consumption:** Python Requests Library

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

pip install -r requirements.txt

3. **Initialize the database:**

python manage.py migrate

4. **Run the server:**
python manage.py runserver

## API Integration
This project consumes external APIs to fetch financial data. You'll need to obtain API keys and configure them in your settings. Please refer to the documentation of the respective APIs for guidance.

## Contributing
Contributions are welcome! If you have a feature request, bug report, or a pull request, please feel free to contribute. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT

## Acknowledgements
Hat tip to everyone who contributed to the tools and libraries we used in this project.

Thank you for exploring the Budget Tracker Project! 🚀