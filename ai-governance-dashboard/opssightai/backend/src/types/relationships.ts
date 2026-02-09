// Asset Relationships Types

export type RelationshipType = 'contains' | 'depends_on' | 'feeds_into' | 'controls';
export type RelationshipStrength = 'weak' | 'normal' | 'strong' | 'critical';
export type GroupType = 'production_line' | 'process_unit' | 'functional' | 'location';

export interface AssetRelationship {
  id?: string;
  parentAssetId: string;
  childAssetId: string;
  relationshipType: RelationshipType;
  relationshipStrength: RelationshipStrength;
  description?: string;
  createdAt?: Date;
}

export interface AssetGroup {
  id?: string;
  name: string;
  description?: string;
  groupType: GroupType;
  plantId: string;
  parentGroupId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssetGroupMember {
  groupId: string;
  assetId: string;
  addedAt?: Date;
}

export interface AssetHierarchyNode {
  id: string;
  name: string;
  type: string;
  status: string;
  currentRiskScore?: number;
  children: AssetHierarchyNode[];
  relationships: {
    type: RelationshipType;
    strength: RelationshipStrength;
  }[];
}

export interface AssetDependency {
  assetId: string;
  assetName: string;
  upstreamAssets: {
    id: string;
    name: string;
    relationshipType: RelationshipType;
    strength: RelationshipStrength;
  }[];
  downstreamAssets: {
    id: string;
    name: string;
    relationshipType: RelationshipType;
    strength: RelationshipStrength;
  }[];
}

export interface ImpactAnalysis {
  originAssetId: string;
  originAssetName: string;
  directlyAffectedAssets: {
    id: string;
    name: string;
    type: string;
    relationshipType: RelationshipType;
    estimatedImpact: string;
  }[];
  indirectlyAffectedAssets: {
    id: string;
    name: string;
    type: string;
    cascadeLevel: number;
    estimatedImpact: string;
  }[];
  totalAffectedAssets: number;
  estimatedProductionLoss?: number; // percentage
  estimatedDowntime?: number; // hours
  criticalityScore: number;
}

export interface CascadeEffect {
  originAssetId: string;
  originAssetName: string;
  cascadePath: {
    level: number;
    assetId: string;
    assetName: string;
    relationshipType: RelationshipType;
    impactSeverity: 'low' | 'medium' | 'high' | 'critical';
    estimatedDelay: number; // minutes
    capacityLoss: number; // percentage
  }[];
  totalCascadeLevels: number;
  maxCapacityLoss: number; // percentage
  totalEstimatedDowntime: number; // hours
}

export interface GroupMetrics {
  groupId: string;
  groupName: string;
  totalAssets: number;
  activeAssets: number;
  averageRiskScore: number;
  highRiskAssets: number;
  totalMaintenanceCost: number;
  averageOEE?: number;
  averageAvailability?: number;
}

export interface AssetTreeNode {
  id: string;
  name: string;
  type: string;
  status: string;
  currentRiskScore?: number;
  parentId?: string;
  level: number;
  hasChildren: boolean;
  isExpanded?: boolean;
  metadata?: Record<string, any>;
}

export interface DependencyGraph {
  nodes: {
    id: string;
    name: string;
    type: string;
    status: string;
    riskScore?: number;
  }[];
  edges: {
    source: string;
    target: string;
    relationshipType: RelationshipType;
    strength: RelationshipStrength;
  }[];
}
