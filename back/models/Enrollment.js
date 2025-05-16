const { DataTypes } = require("sequelize");
const { sequelize } = require("../database");

const Enrollment = sequelize.define("Enrollment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  participantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Participants",
      key: "id",
    },
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Sessions",
      key: "id",
    },
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM("registered", "attended", "cancelled", "no_show"),
    defaultValue: "registered",
  },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "paid", "refunded"),
    defaultValue: "pending",
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

module.exports = Enrollment;
