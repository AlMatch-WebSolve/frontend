import React from 'react'

function Button({ children, onClick, type = "button", style, className }) {
  const baseStyle = {
    display: 'flex',
    fontSize: 20,
    fontWeight: 400,
    padding: '5px 10px',
    background: '#4397F3',
    color: '#FFFFFF',
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-main)',
  };

  return (
    <div>
      <button
        type={type}
        onClick={onClick}
        className={className}
        style={{ ...baseStyle, ...style }}
      >
        {children}
      </button>
    </div>
  )
}

export default Button
