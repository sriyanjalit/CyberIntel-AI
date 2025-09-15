import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ThreatAttributes {
  id: string;
  title: string;
  description: string;
  source: string;
  severity: number;
  category: string;
  status: 'new' | 'analyzing' | 'confirmed' | 'false_positive' | 'resolved';
  relevance: number;
  confidence: number;
  priority: number;
  metadata: any;
  feedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreatCreationAttributes extends Optional<ThreatAttributes, 'id' | 'status' | 'relevance' | 'confidence' | 'priority' | 'metadata' | 'feedId' | 'createdAt' | 'updatedAt'> {}

export class Threat extends Model<ThreatAttributes, ThreatCreationAttributes> implements ThreatAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public source!: string;
  public severity!: number;
  public category!: string;
  public status!: 'new' | 'analyzing' | 'confirmed' | 'false_positive' | 'resolved';
  public relevance!: number;
  public confidence!: number;
  public priority!: number;
  public metadata!: any;
  public feedId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Threat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      validate: {
        min: 0,
        max: 1,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'analyzing', 'confirmed', 'false_positive', 'resolved'),
      allowNull: false,
      defaultValue: 'new',
    },
    relevance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      validate: {
        min: 0,
        max: 1,
      },
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      validate: {
        min: 0,
        max: 1,
      },
    },
    priority: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
      validate: {
        min: 0,
        max: 1,
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    feedId: {
      type: DataTypes.STRING,
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
    tableName: 'threats',
    timestamps: true,
  }
);
