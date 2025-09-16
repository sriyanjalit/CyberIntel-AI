import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ThreatGraphAttributes {
  id: string;
  threatId: string;
  relatedThreatId: string;
  relationshipType: 'similar' | 'related' | 'derived' | 'conflict' | 'timeline';
  confidence: number;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreatGraphCreationAttributes extends Optional<ThreatGraphAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ThreatGraph extends Model<ThreatGraphAttributes, ThreatGraphCreationAttributes> implements ThreatGraphAttributes {
  public id!: string;
  public threatId!: string;
  public relatedThreatId!: string;
  public relationshipType!: 'similar' | 'related' | 'derived' | 'conflict' | 'timeline';
  public confidence!: number;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ThreatGraph.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    threatId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'threats',
        key: 'id',
      },
    },
    relatedThreatId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'threats',
        key: 'id',
      },
    },
    relationshipType: {
      type: DataTypes.ENUM('similar', 'related', 'derived', 'conflict', 'timeline'),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'threat_graphs',
    timestamps: true,
    indexes: [
      {
        fields: ['threatId'],
      },
      {
        fields: ['relatedThreatId'],
      },
      {
        fields: ['relationshipType'],
      },
      {
        fields: ['confidence'],
      },
    ],
  }
);

export default ThreatGraph;
