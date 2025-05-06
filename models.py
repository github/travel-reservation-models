from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Construct from individual components if DATABASE_URL not provided
    db_user = os.getenv('DB_USER', 'user')
    db_password = os.getenv('DB_PASSWORD', 'password')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'travel_reservations')
    DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

# Create engine and session factory
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

class Room(Base):
    """Room model representing hotel rooms."""
    __tablename__ = 'rooms'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    availability = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    # Relationship to reservations
    reservations = relationship("Reservation", back_populates="room")

    def to_dict(self):
        """Convert room object to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'availability': self.availability,
            'price': self.price
        }

class Reservation(Base):
    """Reservation model representing room bookings."""
    __tablename__ = 'reservations'

    id = Column(String, primary_key=True)
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=False)
    guest_name = Column(String, nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    
    # Relationship to room
    room = relationship("Room", back_populates="reservations")

    def to_dict(self):
        """Convert reservation object to dictionary."""
        return {
            'id': self.id,
            'roomId': self.room_id,
            'guestName': self.guest_name,
            'checkIn': self.check_in.isoformat(),
            'checkOut': self.check_out.isoformat()
        }

# Function to get database session
def get_db():
    """Create a new database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to initialize database
def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

# Optional: Function to seed initial data
def seed_db():
    """Seed the database with initial data if tables are empty."""
    db = SessionLocal()
    try:
        # Only seed if rooms table is empty
        if not db.query(Room).first():
            # Add initial rooms
            rooms = [
                Room(id=1, name="Standard Queen", availability=5, price=120),
                Room(id=2, name="Deluxe King", availability=3, price=180)
            ]
            db.add_all(rooms)
            db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()