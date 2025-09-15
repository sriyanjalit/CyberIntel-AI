import { User } from './User';
import { Threat } from './Threat';
import { Alert } from './Alert';
import { Feed } from './Feed';

// Define associations
User.hasMany(Alert, { foreignKey: 'assignedTo', as: 'assignedAlerts' });
Alert.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });

Threat.hasMany(Alert, { foreignKey: 'threatId', as: 'alerts' });
Alert.belongsTo(Threat, { foreignKey: 'threatId', as: 'threat' });

Feed.hasMany(Threat, { foreignKey: 'feedId', as: 'threats' });
Threat.belongsTo(Feed, { foreignKey: 'feedId', as: 'feed' });

export { User, Threat, Alert, Feed };
