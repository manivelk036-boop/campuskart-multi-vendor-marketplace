# 🛒 CampusKart – Multi-Vendor Campus Marketplace

CampusKart is a full-stack e-commerce marketplace designed for college students.

The platform allows users to browse campus products, add products to a cart, place orders, and view their orders.

## 🚀 Project Status

Current MVP development:

- ✅ Spring Boot Backend
- ✅ MySQL Database
- ✅ User Module
- ✅ Product CRUD
- ✅ Order CRUD
- ✅ React Frontend
- ✅ Product Listing
- ✅ Shopping Cart
- 🔄 Cart → Order integration
- 🔄 My Orders
- ⏳ Authentication
- ⏳ Vendor Management
- ⏳ Payment Integration

---

## 🏗️ Project Architecture

```text
CampusKart
│
├── backend
│   ├── src
│   │   └── main
│   │       ├── java
│   │       │   └── com.campuskart.backend
│   │       │       ├── controller
│   │       │       ├── entity
│   │       │       ├── repository
│   │       │       └── service
│   │       │           └── impl
│   │       │
│   │       └── resources
│   │           └── application.properties
│   │
│   └── pom.xml
│
└── frontend
    ├── src
    │   ├── components
    │   ├── pages
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.css
    │
    ├── package.json
    └── vite.config.js
````

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* Axios

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Spring Security
* Maven

### Database

* MySQL

### Development Tools

* VS Code
* IntelliJ IDEA / Eclipse
* MySQL Workbench
* Postman
* Git
* GitHub

---

## 🔥 Current Features

### 👤 User

* User entity
* User repository
* User service
* User controller

### 📦 Products

Product CRUD APIs:

```text
POST   /api/products
GET    /api/products
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
```

Additional APIs:

```text
GET /api/products/name/{productName}
GET /api/products/category/{category}
```

### 🛒 Shopping Cart

The React frontend currently supports:

* Product listing
* Add to cart
* Cart item count
* Cart product display
* Quantity management
* Cart total calculation

### 📋 Orders

Order APIs:

```text
POST   /api/orders
GET    /api/orders
GET    /api/orders/{id}
PUT    /api/orders/{id}
DELETE /api/orders/{id}
```

Additional APIs:

```text
GET /api/orders/user/{userId}
GET /api/orders/product/{productId}
GET /api/orders/status/{status}
```

---

## 🔄 Current Application Flow

```text
User
 ↓
React Frontend
 ↓
Browse Products
 ↓
Add Product to Cart
 ↓
Cart
 ↓
Place Order
 ↓
Spring Boot REST API
 ↓
Order Service
 ↓
MySQL Database
```

---

## 🌐 Local Development

### Backend

Navigate to:

```bash
cd backend
```

Run:

```bash
./mvnw spring-boot:run
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

### Frontend

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

Frontend normally runs on:

```text
http://localhost:5173
```

If that port is already occupied, Vite automatically selects another available port.

---

## 🗄️ Database

MySQL database:

```text
campuskart_db
```

Spring Boot connects to MySQL using Spring Data JPA.

---

## 🧪 API Testing

Postman is used to test the backend REST APIs.

Example:

```text
GET http://localhost:8080/api/products
```

Create product:

```text
POST http://localhost:8080/api/products
```

Example request:

```json
{
  "productName": "Gaming Laptop",
  "description": "Dell G15 Gaming Laptop",
  "price": 85000,
  "quantity": 5,
  "category": "Electronics"
}
```

---

## 📅 Development Progress

| Day    | Work                           |
| ------ | ------------------------------ |
| Day 1  | Project setup                  |
| Day 2  | User module                    |
| Day 3  | Backend configuration          |
| Day 4  | Product module                 |
| Day 5  | Product CRUD                   |
| Day 6  | Order module                   |
| Day 7  | Order APIs                     |
| Day 8  | Product CRUD completion        |
| Day 9  | React frontend + shopping cart |
| Day 10 | Cart → Order integration       |

---

## 🎯 MVP Goal

The main MVP goal is to demonstrate a complete campus shopping flow:

```text
Browse Product
      ↓
Add to Cart
      ↓
View Cart
      ↓
Place Order
      ↓
Save Order
      ↓
View My Orders
```

---

## 🔮 Future Improvements

* JWT Authentication
* Student/Vendor/Admin roles
* Vendor dashboard
* Product image upload
* Product search
* Product filtering
* Order tracking
* Payment gateway
* Email notifications
* Reviews and ratings
* AI-powered product recommendations
* Deployment using cloud services

---

## 👨‍💻 Developer

**Manivelkumar S**

BE Computer Science and Engineering

J.J. College of Engineering and Technology, Trichy

---


