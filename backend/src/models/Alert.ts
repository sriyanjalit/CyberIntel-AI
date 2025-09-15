import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AlertAttributes {
  id: string;
  threatId: string;
  title: string;
  description: string;
  severity: number;
  category: string;
  source: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  notes?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'assignedTo' | 'notes' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: string;
  public threatId!: string;
  public title!: string;
  public description!: string;
  public severity!: number;
  public category!: string;
  public source!: string;
  public status!: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  public assignedTo?: string;
  public notes?: string;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    threatId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'acknowledged', 'investigating', 'resolved', 'false_positive'),
      allowNull: false,
      defaultValue: 'new',
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'alerts',
    timestamps: true,
  }
);
