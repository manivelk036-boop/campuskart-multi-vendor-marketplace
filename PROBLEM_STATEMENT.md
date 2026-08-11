# Problem Statement

## CampusKart – Multi-Vendor Campus Marketplace

### 1. Problem Overview

College students frequently need products such as stationery, electronics, books, accessories, snacks, and other daily-use items. However, finding these products within or around the campus can be time-consuming.

At the same time, many students and campus vendors sell useful products but do not have a centralized digital platform to showcase their products and manage customer orders.

Existing e-commerce platforms are designed for large-scale marketplaces and may not specifically address the needs of a college campus community.

Therefore, there is a need for a dedicated digital marketplace that connects students, campus sellers, and administrators in one platform.

---

## 2. Problem Statement

Develop a **full-stack multi-vendor e-commerce platform called CampusKart** that enables students to browse products from campus sellers, add products to a shopping cart, place orders, and view their orders.

The system should also provide backend services for managing users, products, sellers, inventory, and orders.

The application should provide a simple, secure, and user-friendly shopping experience specifically designed for a campus environment.

---

## 3. Existing Problems

The current campus shopping process has several limitations:

- Students may not know which sellers are available on campus.
- Product information and prices are not centralized.
- Students often need to physically visit different sellers to compare products.
- Sellers may depend on informal methods such as WhatsApp or direct communication for orders.
- There is no centralized order management system.
- Product availability and stock information may not be updated properly.
- Tracking previous purchases can be difficult.
- Campus-specific sellers have limited digital visibility.

---

## 4. Proposed Solution

CampusKart provides a centralized online marketplace specifically for the campus community.

The system will allow:

### Customers / Students

- Register and log in.
- Browse available products.
- View product details and prices.
- Add products to a shopping cart.
- Increase or decrease product quantity.
- Remove products from the cart.
- Place orders.
- View previous orders.

### Sellers

- Add products.
- Update product information.
- Manage product prices.
- Manage available stock.
- View customer orders.

### Administrator

- Manage users.
- Manage sellers.
- Manage products.
- Monitor orders.
- Maintain the overall marketplace.

---

## 5. Main Objectives

The primary objectives of CampusKart are:

1. To create a centralized digital marketplace for campus products.
2. To simplify product discovery for students.
3. To provide an easy online ordering system.
4. To help campus sellers showcase and manage their products.
5. To provide centralized product and order management.
6. To maintain product inventory and availability.
7. To provide role-based access for customers, sellers, and administrators.
8. To develop a scalable Java-based backend using Spring Boot.
9. To provide a responsive and user-friendly frontend.
10. To reduce the time and effort required for campus shopping.

---

## 6. Target Users

CampusKart is designed for:

- College Students
- Campus Sellers
- Faculty/Staff
- Marketplace Administrators

---

## 7. Functional Requirements

### User Authentication

- User registration
- User login
- User logout
- Role-based access

### Product Management

- Add product
- View products
- Update product
- Delete product
- Search products
- Filter products by category
- Manage product quantity

### Shopping Cart

- Add product to cart
- Update quantity
- Remove product
- Calculate total price

### Order Management

- Place order
- Store order details
- Track order status
- View order history

### Admin Management

- Manage users
- Manage sellers
- Manage products
- Manage orders

---

## 8. Non-Functional Requirements

### Performance

The application should respond quickly to user requests and efficiently handle product and order operations.

### Security

User authentication and authorization should be implemented to protect application resources and user information.

### Scalability

The backend architecture should allow additional users, products, sellers, and features to be added in the future.

### Usability

The application should have a simple and intuitive interface that students can easily understand.

### Maintainability

The application should follow a modular architecture so that frontend, backend, and database components can be maintained independently.

---

## 9. Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- Axios

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- Maven

### Database

- MySQL

### Development Tools

- Visual Studio Code
- IntelliJ IDEA / Eclipse
- MySQL Workbench
- Git
- GitHub

---

## 10. System Architecture

CampusKart follows a three-layer architecture:

```text
                CampusKart
                    |
        +-----------+-----------+
        |                       |
     Frontend                Backend
     React.js              Spring Boot
        |                       |
        |                     REST API
        |                       |
        +-----------+-----------+
                    |
                 MySQL
                 Database