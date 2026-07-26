
-- =============================================
-- MYSQL COMPATIBLE SCRIPT FOR MYSQL WORKBENCH
-- =============================================

-- Create Database (if not exists)
CREATE DATABASE IF NOT EXISTS HotelPortalDB;
USE HotelPortalDB;

-- =============================================
-- TABLE CREATION
-- =============================================

-- USERS Table
CREATE TABLE IF NOT EXISTS Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NULL,
    Role VARCHAR(10) NOT NULL CHECK (Role IN ('admin','guest')),
    Phone VARCHAR(30),
    Country VARCHAR(80),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GUESTS Table
CREATE TABLE IF NOT EXISTS Guests (
    GuestId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    LoyaltyPoints INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);

-- ROOMS Table
CREATE TABLE IF NOT EXISTS Rooms (
    RoomId INT AUTO_INCREMENT PRIMARY KEY,
    RoomNumber VARCHAR(10) NOT NULL UNIQUE,
    RoomType VARCHAR(20) NOT NULL CHECK (RoomType IN ('Single','Double','Suite','Deluxe')),
    Floor INT NOT NULL,
    Capacity INT NOT NULL DEFAULT 2,
    BasePricePerNight DECIMAL(10,2) NOT NULL,
    Description VARCHAR(500),
    Amenities VARCHAR(200),
    Status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (Status IN ('Available','Occupied','Under Maintenance','Reserved')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS Table
CREATE TABLE IF NOT EXISTS Bookings (
    BookingId INT AUTO_INCREMENT PRIMARY KEY,
    GuestId INT NOT NULL,
    RoomId INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    Nights INT NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending','Confirmed','Checked-In','Checked-Out','Cancelled')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GuestId) REFERENCES Guests(GuestId),
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId)
);

-- SEASONAL PRICING Table
CREATE TABLE IF NOT EXISTS SeasonalPricing (
    PricingId INT AUTO_INCREMENT PRIMARY KEY,
    SeasonName VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    RoomType VARCHAR(20) NULL,
    PriceMultiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SERVICE MENU ITEMS Table
CREATE TABLE IF NOT EXISTS ServiceMenuItems (
    ItemId INT AUTO_INCREMENT PRIMARY KEY,
    ItemName VARCHAR(100) NOT NULL,
    Category VARCHAR(20) NOT NULL CHECK (Category IN ('Food','Beverage','Housekeeping','Laundry','Maintenance')),
    Price DECIMAL(10,2) NOT NULL,
    IsAvailable BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SERVICE REQUESTS Table
CREATE TABLE IF NOT EXISTS ServiceRequests (
    RequestId INT AUTO_INCREMENT PRIMARY KEY,
    BookingId INT NOT NULL,
    GuestId INT NOT NULL,
    ItemId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Notes VARCHAR(300),
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending','In Progress','Completed')),
    RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId),
    FOREIGN KEY (GuestId) REFERENCES Guests(GuestId),
    FOREIGN KEY (ItemId) REFERENCES ServiceMenuItems(ItemId)
);

-- CONTACT MESSAGES Table
CREATE TABLE IF NOT EXISTS ContactMessages (
    MessageId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NULL,
    GuestName VARCHAR(100) NOT NULL,
    GuestEmail VARCHAR(150) NOT NULL,
    Subject VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE SET NULL
);

-- =============================================
-- SEED DATA
-- =============================================

-- Admin User
INSERT IGNORE INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country)
VALUES ('Admin User', 'admin@hotel.com', 
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin123', 'admin', '+1-800-000-0001', 'USA');

-- Guest 1 (John Smith)
INSERT IGNORE INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country)
VALUES ('John Smith', 'guest@hotel.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'guest123', 'guest', '+1-555-123-4567', 'USA');

-- Insert Guest record for John Smith
INSERT INTO Guests (UserId, LoyaltyPoints)
SELECT UserId, 120 FROM Users WHERE Email = 'guest@hotel.com'
ON DUPLICATE KEY UPDATE LoyaltyPoints = LoyaltyPoints;

-- Mubashir (You)
INSERT IGNORE INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country)
VALUES ('Mubashir Khan', 'mubashir@hotel.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'mjmubashir', 'guest', '03112988764', 'Pakistan');

-- Insert Guest record for Mubashir
INSERT INTO Guests (UserId, LoyaltyPoints)
SELECT UserId, 80 FROM Users WHERE Email = 'mubashir@hotel.com'
ON DUPLICATE KEY UPDATE LoyaltyPoints = LoyaltyPoints;

-- Rooms
INSERT IGNORE INTO Rooms (RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description, Amenities, Status)
VALUES
('101','Single',1,1,89.00,'Cozy single room with city view','WiFi,AC,TV','Available'),
('102','Single',1,1,89.00,'Standard single room','WiFi,AC,TV','Available'),
('103','Single',1,1,89.00,'Standard single room','WiFi,AC,TV','Available'),
('201','Double',2,2,149.00,'Spacious double room','WiFi,AC,TV,Minibar','Available'),
('202','Double',2,2,149.00,'Double room with balcony','WiFi,AC,TV,Minibar,Balcony','Available'),
('301','Suite',3,3,299.00,'Luxury suite','WiFi,AC,TV,Minibar,Jacuzzi','Available'),
('302','Suite',3,3,299.00,'Luxury suite','WiFi,AC,TV,Minibar,Jacuzzi','Available'),
('401','Deluxe',4,4,449.00,'Presidential Deluxe suite','WiFi,AC,TV,Minibar,Jacuzzi','Available'),
('402','Deluxe',4,4,449.00,'Presidential Deluxe suite','WiFi,AC,TV,Minibar,Jacuzzi','Available');

-- Seasonal Pricing
INSERT IGNORE INTO SeasonalPricing (SeasonName, StartDate, EndDate, RoomType, PriceMultiplier) 
VALUES
('Peak Summer','2026-06-01','2026-08-31',NULL,1.50),
('Holiday Season','2026-12-20','2027-01-05',NULL,1.75);

-- Service Items
INSERT IGNORE INTO ServiceMenuItems (ItemName, Category, Price, IsAvailable) VALUES
('Club Sandwich','Food',14.00,1),
('Zinger Burger','Food',20.00,1),
('Cheese Burger','Food',16.00,1),
('Caesar Salad','Food',12.00,1),
('Grilled Salmon','Food',28.00,1),
('Room Cleaning','Housekeeping',0.00,1),
('Laundry Service','Laundry',15.00,1);

-- Dummy Contact Message
INSERT IGNORE INTO ContactMessages (UserId, GuestName, GuestEmail, Subject, Message, IsRead)
SELECT 
    UserId,
    'John Doe',
    'john.doe@example.com',
    'Booking Inquiry',
    'How can we help you? I wanted to know if late check-out is available for standard rooms.',
    0
FROM Users WHERE Email = 'guest@hotel.com';

-- =============================================
-- FINAL VERIFICATION
-- =============================================
SELECT * FROM Users;
SELECT COUNT(*) AS Total_Rooms FROM Rooms;
SELECT COUNT(*) AS Total_ContactMessages FROM ContactMessages;

SELECT * FROM ServiceRequests;
SELECT * FROM SeasonalPricing;
SELECT * FROM ServiceMenuItems;

SELECT * FROM ContactMessages;