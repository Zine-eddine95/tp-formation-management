const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Fund = sequelize.define("Fund", {
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
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  requestDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  approvalDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Projects",
      key: "id",
    },
  },
  requestedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  approvedById: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users",
      key: "id",
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
  attachments: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue("attachments");
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue("attachments", JSON.stringify(value));
    },
  },
});

module.exports = Fund;
