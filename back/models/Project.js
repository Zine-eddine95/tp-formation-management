const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("planned", "in_progress", "completed", "cancelled"),
    defaultValue: "planned",
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  expenses: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Clients",
      key: "id",
    },
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users",
      key: "id",
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Project;
