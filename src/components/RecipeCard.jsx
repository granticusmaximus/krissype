import React from 'react';
import { Card, CardBody, CardImg, CardTitle } from 'reactstrap';
import './RecipeCard.css'; // optional if using external styles

const RecipeCard = ({ title, imageUrl, onClick, course = [], categories = [] }) => {
  return (
    <Card
      onClick={onClick}
      className="recipe-card border-0 shadow-sm h-100"
      style={{ transition: 'transform 0.2s ease-in-out', cursor: 'pointer' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
    >
      <CardImg
        top
        width="100%"
        height="200px"
        src={imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={title}
        style={{ objectFit: 'cover' }}
      />
      <CardBody>
        <CardTitle tag="h5">{title}</CardTitle>
        <div className="mt-2">
          {course.map((c, i) => (
            <span key={`course-${i}`} className="badge rounded-pill bg-info text-dark me-1">#{c}</span>
          ))}
          {categories.map((cat, i) => (
            <span key={`category-${i}`} className="badge rounded-pill bg-secondary text-light me-1">#{cat}</span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default RecipeCard;