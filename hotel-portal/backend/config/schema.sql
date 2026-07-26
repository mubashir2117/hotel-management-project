-- ============================================================
-- Hotel Portal Database Setup Script (Clean Version)
-- Run this ONCE in SQL Server Management Studio
-- ============================================================


-- Create Database
CREATE DATABASE HotelPortalDB;
GO

USE HotelPortalDB;
GO

-- =============================================
-- TABLE CREATION
-- =============================================

-- USERS Table
IF OBJECT_ID('Users', 'U') IS NULL
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NULL,           -- Plain password for development
    Role VARCHAR(10) NOT NULL CHECK (Role IN ('admin','guest')),
    Phone VARCHAR(30),
    Country NVARCHAR(80),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- GUESTS Table
IF OBJECT_ID('Guests', 'U') IS NULL
CREATE TABLE Guests (
    GuestId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES Users(UserId) ON DELETE CASCADE,
    LoyaltyPoints INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- ROOMS, BOOKINGS, SeasonalPricing, ServiceMenuItems, ServiceRequests (same as before)
IF OBJECT_ID('Rooms', 'U') IS NULL
CREATE TABLE Rooms (
    RoomId INT IDENTITY(1,1) PRIMARY KEY,
    RoomNumber VARCHAR(10) NOT NULL UNIQUE,
    RoomType VARCHAR(20) NOT NULL CHECK (RoomType IN ('Single','Double','Suite','Deluxe')),
    Floor INT NOT NULL,
    Capacity INT NOT NULL DEFAULT 2,
    BasePricePerNight DECIMAL(10,2) NOT NULL,
    Description NVARCHAR(500),
    Amenities VARCHAR(200),
    Status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (Status IN ('Available','Occupied','Under Maintenance','Reserved')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

IF OBJECT_ID('Bookings', 'U') IS NULL
CREATE TABLE Bookings (
    BookingId INT IDENTITY(1,1) PRIMARY KEY,
    GuestId INT NOT NULL REFERENCES Guests(GuestId),
    RoomId INT NOT NULL REFERENCES Rooms(RoomId),
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    Nights INT NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending','Confirmed','Checked-In','Checked-Out','Cancelled')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

IF OBJECT_ID('SeasonalPricing', 'U') IS NULL
CREATE TABLE SeasonalPricing (
    PricingId INT IDENTITY(1,1) PRIMARY KEY,
    SeasonName VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    RoomType VARCHAR(20) NULL,
    PriceMultiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

IF OBJECT_ID('ServiceMenuItems', 'U') IS NULL
CREATE TABLE ServiceMenuItems (
    ItemId INT IDENTITY(1,1) PRIMARY KEY,
    ItemName NVARCHAR(100) NOT NULL,
    Category VARCHAR(20) NOT NULL CHECK (Category IN ('Food','Beverage','Housekeeping','Laundry','Maintenance')),
    Price DECIMAL(10,2) NOT NULL,
    IsAvailable BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

IF OBJECT_ID('ServiceRequests', 'U') IS NULL
CREATE TABLE ServiceRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    BookingId INT NOT NULL REFERENCES Bookings(BookingId),
    GuestId INT NOT NULL REFERENCES Guests(GuestId),
    ItemId INT NOT NULL REFERENCES ServiceMenuItems(ItemId),
    Quantity INT NOT NULL DEFAULT 1,
    Notes NVARCHAR(300),
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending','In Progress','Completed')),
    RequestedAt DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- CONTACT MESSAGES TABLE
-- =============================================
IF OBJECT_ID('ContactMessages', 'U') IS NULL
CREATE TABLE ContactMessages (
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL REFERENCES Users(UserId) ON DELETE SET NULL,
    GuestName NVARCHAR(100) NOT NULL,
    GuestEmail VARCHAR(150) NOT NULL,
    Subject NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Unread' CHECK (Status IN ('Unread', 'Read', 'Replied')),
    SubmittedAt DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- SEED DATA
-- =============================================

-- Admin
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@hotel.com')
    INSERT INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country)
    VALUES ('Admin User', 'admin@hotel.com', 
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'admin123', 'admin', '+1-800-000-0001', 'USA');
GO

-- Guest 1
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'guest@hotel.com')
BEGIN
    INSERT INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country)
    VALUES ('John Smith', 'guest@hotel.com',
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'guest123', 'guest', '+1-555-123-4567', 'USA');
    INSERT INTO Guests (UserId, LoyaltyPoints) VALUES (SCOPE_IDENTITY(), 120);
END
GO

-- Mubashir (You)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'mubashir@hotel.com')
BEGIN
    INSERT INTO Users (Name, Email, PasswordHash, Password, Role, Phone, Country)
    VALUES ('Mubashir Khan', 'mubashir@hotel.com',
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'mjmubashir', 'guest', '03112988764', 'Pakistan');
    INSERT INTO Guests (UserId, LoyaltyPoints) VALUES (SCOPE_IDENTITY(), 80);
END
GO

-- Rooms, Seasonal Pricing, Services (same as your original)
IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomNumber = '101')
INSERT INTO Rooms (RoomNumber, RoomType, Floor, Capacity, BasePricePerNight, Description, Amenities, Status)
VALUES
('101','Single',1,1,89.00,'Cozy single room with city view','WiFi,AC,TV','Available'),
('102','Single',1,1,89.00,'Standard single room','WiFi,AC,TV','Available'),
('201','Double',2,2,149.00,'Spacious double room','WiFi,AC,TV,Minibar','Available'),
('202','Double',2,2,149.00,'Double room with balcony','WiFi,AC,TV,Minibar,Balcony','Available'),
('301','Suite',3,3,299.00,'Luxury suite','WiFi,AC,TV,Minibar,Jacuzzi','Available'),
('401','Deluxe',4,4,449.00,'Presidential Deluxe suite','WiFi,AC,TV,Minibar,Jacuzzi','Available');
GO

-- Seasonal Pricing
INSERT INTO SeasonalPricing (SeasonName, StartDate, EndDate, RoomType, PriceMultiplier) 
VALUES
('Peak Summer','2026-06-01','2026-08-31',NULL,1.50),
('Holiday Season','2026-12-20','2027-01-05',NULL,1.75);
GO

-- Service Items
INSERT INTO ServiceMenuItems (ItemName, Category, Price, IsAvailable) VALUES
('Club Sandwich','Food',14.00,1),
('Cheese Burger','Food',16.00,1),
('Caesar Salad','Food',12.00,1),
('Grilled Salmon','Food',28.00,1),
('Room Cleaning','Housekeeping',0.00,1),
('Laundry Service','Laundry',15.00,1);
GO

-- Dummy Contact Message
IF NOT EXISTS (SELECT 1 FROM ContactMessages WHERE GuestEmail = 'john.doe@example.com')
    INSERT INTO ContactMessages (UserId, GuestName, GuestEmail, Subject, Message, Status)
    VALUES (
        (SELECT TOP 1 UserId FROM Users WHERE Email = 'guest@hotel.com'),
        'John Doe',
        'john.doe@example.com',
        'Booking Inquiry',
        'How can we help you? I wanted to know if late check-out is available for standard rooms.',
        'Unread'
    );
GO


-- Final Verification
SELECT * FROM Users;
SELECT COUNT(*) AS Total_Rooms FROM Rooms;
SELECT COUNT(*) AS Total_Contact_Messages FROM ContactMessages;

SELECT * FROM Bookings;
SELECT * FROM ContactMessages;

GO