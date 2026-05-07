import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage + 1}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages || 1}</strong>
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.25rem' }}
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            className={`btn ${currentPage + 1 === page ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.75rem', minWidth: '32px' }}
            onClick={() => onPageChange(page - 1)}
          >
            {page}
          </button>
        ))}

        <button 
          className="btn btn-secondary"
          style={{ padding: '0.25rem' }}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;











