// src/components/RecipeCard.jsx
import React from 'react';
import { Card, CardBody, CardImg, CardTitle, Button } from 'reactstrap';

const RecipeCard = ({ title, imageUrl, onClick, onDelete, course = [], categories = [] }) => {
  const safeImageUrl = imageUrl && imageUrl.length > 0
    ? imageUrl
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Card
      onClick={onClick}
      className="position-relative border-0 shadow-sm h-100"
      style={{ cursor: 'pointer' }}
    >
      <CardImg
        top
        width="100%"
        height="200px"
        src={safeImageUrl}
        alt={title}
        style={{ objectFit: 'cover' }}
      />
      
      {/* Delete Button */}
      {onDelete && (
        <Button
          color="danger"
          size="sm"
          className="position-absolute top-0 end-0 m-2"
          onClick={(e) => {
            e.stopPropagation(); // prevent card click
            onDelete();
          }}
        >
          🗑️
        </Button>
      )}

      <CardBody>
        <CardTitle tag="h5">{title}</CardTitle>
        <div className="mt-2">
          {course.map((c, i) => (
            <span key={`course-${i}`} className="badge rounded-pill bg-info text-dark me-1">
              #{c}
            </span>
          ))}
          {categories.map((cat, i) => (
            <span key={`category-${i}`} className="badge rounded-pill bg-secondary text-light me-1">
              #{cat}
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default RecipeCard;