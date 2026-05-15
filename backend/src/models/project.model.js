'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 150],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'completed'),
      defaultValue: 'active',
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#6366f1',
      validate: {
        is: /^#[0-9A-Fa-f]{6}$/,
      },
    },
  }, {
    tableName: 'projects',
    timestamps: true,
  });

  return Project;
};
