import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FeedAttributes {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'csv' | 'json' | 'web' | 'xml';
  category: 'open_web' | 'dark_web' | 'threat_feeds';
  enabled: boolean;
  lastFetch?: Date;
  fetchInterval: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedCreationAttributes extends Optional<FeedAttributes, 'id' | 'enabled' | 'lastFetch' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class Feed extends Model<FeedAttributes, FeedCreationAttributes> implements FeedAttributes {
  public id!: string;
  public name!: string;
  public url!: string;
  public type!: 'rss' | 'api' | 'csv' | 'json' | 'web' | 'xml';
  public category!: 'open_web' | 'dark_web' | 'threat_feeds';
  public enabled!: boolean;
  public lastFetch?: Date;
  public fetchInterval!: string;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Feed.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    type: {
      type: DataTypes.ENUM('rss', 'api', 'csv', 'json', 'web', 'xml'),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('open_web', 'dark_web', 'threat_feeds'),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastFetch: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fetchInterval: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0 */6 * * *',
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
    tableName: 'feeds',
    timestamps: true,
  }
);
