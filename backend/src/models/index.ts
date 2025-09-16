import { User } from './User';
import { Threat } from './Threat';
import { Alert } from './Alert';
import { Feed } from './Feed';
import ThreatGraph from './ThreatGraph';

// Define associations
User.hasMany(Alert, { foreignKey: 'assignedTo', as: 'assignedAlerts' });
Alert.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });

Threat.hasMany(Alert, { foreignKey: 'threatId', as: 'alerts' });
Alert.belongsTo(Threat, { foreignKey: 'threatId', as: 'threat' });

Feed.hasMany(Threat, { foreignKey: 'feedId', as: 'threats' });
Threat.belongsTo(Feed, { foreignKey: 'feedId', as: 'feed' });

// Threat Graph associations
Threat.hasMany(ThreatGraph, { foreignKey: 'threatId', as: 'relationships' });
ThreatGraph.belongsTo(Threat, { foreignKey: 'threatId', as: 'threat' });

Threat.hasMany(ThreatGraph, { foreignKey: 'relatedThreatId', as: 'relatedRelationships' });
ThreatGraph.belongsTo(Threat, { foreignKey: 'relatedThreatId', as: 'relatedThreat' });

export { User, Threat, Alert, Feed, ThreatGraph };
