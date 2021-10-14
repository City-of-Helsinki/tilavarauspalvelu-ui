import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: any;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
  /**
   * The `Time` scalar type represents a Time value as
   * specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Time: any;
  /**
   * Leverages the internal Python implmeentation of UUID (uuid.UUID) to provide native UUID objects
   * in fields, resolvers and input.
   */
  UUID: any;
};

/** An enumeration. */
export enum ApplicationRoundTargetGroup {
  /** Kaikki */
  All = 'ALL',
  /** Internal */
  Internal = 'INTERNAL',
  /** Public */
  Public = 'PUBLIC'
}

export type ApplicationRoundType = {
  __typename?: 'ApplicationRoundType';
  allocating: Scalars['Boolean'];
  applicationPeriodBegin: Scalars['DateTime'];
  applicationPeriodEnd: Scalars['DateTime'];
  criteriaEn?: Maybe<Scalars['String']>;
  criteriaFi?: Maybe<Scalars['String']>;
  criteriaSv?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  publicDisplayBegin: Scalars['DateTime'];
  publicDisplayEnd: Scalars['DateTime'];
  purposes: PurposeTypeConnection;
  reservationPeriodBegin: Scalars['Date'];
  reservationPeriodEnd: Scalars['Date'];
  reservationUnits: ReservationUnitByPkTypeConnection;
  targetGroup: ApplicationRoundTargetGroup;
};


export type ApplicationRoundTypePurposesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};


export type ApplicationRoundTypeReservationUnitsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type BuildingType = Node & {
  __typename?: 'BuildingType';
  district?: Maybe<DistrictType>;
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  realEstate?: Maybe<RealEstateType>;
  surfaceArea?: Maybe<Scalars['Float']>;
};

export type DistrictType = Node & {
  __typename?: 'DistrictType';
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type EquipmentCategoryCreateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};

export type EquipmentCategoryCreateMutationPayload = {
  __typename?: 'EquipmentCategoryCreateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  equipmentCategory?: Maybe<EquipmentCategoryType>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};

export type EquipmentCategoryDeleteMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['ID']>;
};

export type EquipmentCategoryDeleteMutationPayload = {
  __typename?: 'EquipmentCategoryDeleteMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  errors?: Maybe<Scalars['String']>;
};

export type EquipmentCategoryType = Node & {
  __typename?: 'EquipmentCategoryType';
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type EquipmentCategoryTypeConnection = {
  __typename?: 'EquipmentCategoryTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<EquipmentCategoryTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `EquipmentCategoryType` and its cursor. */
export type EquipmentCategoryTypeEdge = {
  __typename?: 'EquipmentCategoryTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<EquipmentCategoryType>;
};

export type EquipmentCategoryUpdateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
};

export type EquipmentCategoryUpdateMutationPayload = {
  __typename?: 'EquipmentCategoryUpdateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  equipmentCategory?: Maybe<EquipmentCategoryType>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type EquipmentCreateMutationInput = {
  categoryId: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};

export type EquipmentCreateMutationPayload = {
  __typename?: 'EquipmentCreateMutationPayload';
  categoryId?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  equipment?: Maybe<EquipmentType>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};

export type EquipmentDeleteMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['ID']>;
};

export type EquipmentDeleteMutationPayload = {
  __typename?: 'EquipmentDeleteMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  errors?: Maybe<Scalars['String']>;
};

export type EquipmentType = Node & {
  __typename?: 'EquipmentType';
  category?: Maybe<EquipmentCategoryType>;
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type EquipmentTypeConnection = {
  __typename?: 'EquipmentTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<EquipmentTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `EquipmentType` and its cursor. */
export type EquipmentTypeEdge = {
  __typename?: 'EquipmentTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<EquipmentType>;
};

export type EquipmentUpdateMutationInput = {
  categoryId: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
};

export type EquipmentUpdateMutationPayload = {
  __typename?: 'EquipmentUpdateMutationPayload';
  categoryId?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  equipment?: Maybe<EquipmentType>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type ErrorType = {
  __typename?: 'ErrorType';
  field: Scalars['String'];
  messages: Array<Scalars['String']>;
};

export type KeywordCategoryType = Node & {
  __typename?: 'KeywordCategoryType';
  /** The ID of the object. */
  id: Scalars['ID'];
  keywordGroups?: Maybe<Array<Maybe<KeywordGroupType>>>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type KeywordCategoryTypeConnection = {
  __typename?: 'KeywordCategoryTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<KeywordCategoryTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `KeywordCategoryType` and its cursor. */
export type KeywordCategoryTypeEdge = {
  __typename?: 'KeywordCategoryTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<KeywordCategoryType>;
};

export type KeywordGroupType = Node & {
  __typename?: 'KeywordGroupType';
  /** The ID of the object. */
  id: Scalars['ID'];
  keywords?: Maybe<Array<Maybe<KeywordType>>>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type KeywordGroupTypeConnection = {
  __typename?: 'KeywordGroupTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<KeywordGroupTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `KeywordGroupType` and its cursor. */
export type KeywordGroupTypeEdge = {
  __typename?: 'KeywordGroupTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<KeywordGroupType>;
};

export type KeywordType = Node & {
  __typename?: 'KeywordType';
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type KeywordTypeConnection = {
  __typename?: 'KeywordTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<KeywordTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `KeywordType` and its cursor. */
export type KeywordTypeEdge = {
  __typename?: 'KeywordTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<KeywordType>;
};

export type LocationType = Node & {
  __typename?: 'LocationType';
  addressCityEn?: Maybe<Scalars['String']>;
  addressCityFi?: Maybe<Scalars['String']>;
  addressCitySv?: Maybe<Scalars['String']>;
  addressStreetEn?: Maybe<Scalars['String']>;
  addressStreetFi?: Maybe<Scalars['String']>;
  addressStreetSv?: Maybe<Scalars['String']>;
  addressZip: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  latitude?: Maybe<Scalars['String']>;
  longitude?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEquipment?: Maybe<EquipmentCreateMutationPayload>;
  createEquipmentCategory?: Maybe<EquipmentCategoryCreateMutationPayload>;
  createPurpose?: Maybe<PurposeCreateMutationPayload>;
  createReservation?: Maybe<ReservationMutationPayload>;
  createReservationUnit?: Maybe<ReservationUnitCreateMutationPayload>;
  createResource?: Maybe<ResourceCreateMutationPayload>;
  createSpace?: Maybe<SpaceCreateMutationPayload>;
  deleteEquipment?: Maybe<EquipmentDeleteMutationPayload>;
  deleteEquipmentCategory?: Maybe<EquipmentCategoryDeleteMutationPayload>;
  deleteResource?: Maybe<ResourceDeleteMutationPayload>;
  deleteSpace?: Maybe<SpaceDeleteMutationPayload>;
  updateEquipment?: Maybe<EquipmentUpdateMutationPayload>;
  updateEquipmentCategory?: Maybe<EquipmentCategoryUpdateMutationPayload>;
  updatePurpose?: Maybe<PurposeUpdateMutationPayload>;
  updateReservationUnit?: Maybe<ReservationUnitUpdateMutationPayload>;
  updateResource?: Maybe<ResourceUpdateMutationPayload>;
  updateSpace?: Maybe<SpaceUpdateMutationPayload>;
  updateUnit?: Maybe<UnitUpdateMutationPayload>;
};


export type MutationCreateEquipmentArgs = {
  input: EquipmentCreateMutationInput;
};


export type MutationCreateEquipmentCategoryArgs = {
  input: EquipmentCategoryCreateMutationInput;
};


export type MutationCreatePurposeArgs = {
  input: PurposeCreateMutationInput;
};


export type MutationCreateReservationArgs = {
  input: ReservationMutationInput;
};


export type MutationCreateReservationUnitArgs = {
  input: ReservationUnitCreateMutationInput;
};


export type MutationCreateResourceArgs = {
  input: ResourceCreateMutationInput;
};


export type MutationCreateSpaceArgs = {
  input: SpaceCreateMutationInput;
};


export type MutationDeleteEquipmentArgs = {
  input: EquipmentDeleteMutationInput;
};


export type MutationDeleteEquipmentCategoryArgs = {
  input: EquipmentCategoryDeleteMutationInput;
};


export type MutationDeleteResourceArgs = {
  input: ResourceDeleteMutationInput;
};


export type MutationDeleteSpaceArgs = {
  input: SpaceDeleteMutationInput;
};


export type MutationUpdateEquipmentArgs = {
  input: EquipmentUpdateMutationInput;
};


export type MutationUpdateEquipmentCategoryArgs = {
  input: EquipmentCategoryUpdateMutationInput;
};


export type MutationUpdatePurposeArgs = {
  input: PurposeUpdateMutationInput;
};


export type MutationUpdateReservationUnitArgs = {
  input: ReservationUnitUpdateMutationInput;
};


export type MutationUpdateResourceArgs = {
  input: ResourceUpdateMutationInput;
};


export type MutationUpdateSpaceArgs = {
  input: SpaceUpdateMutationInput;
};


export type MutationUpdateUnitArgs = {
  input: UnitUpdateMutationInput;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  id: Scalars['ID'];
};

export type OpeningHoursType = {
  __typename?: 'OpeningHoursType';
  openingTimePeriods?: Maybe<Array<Maybe<PeriodType>>>;
  openingTimes?: Maybe<Array<Maybe<OpeningTimesType>>>;
};

export type OpeningTimesType = {
  __typename?: 'OpeningTimesType';
  date?: Maybe<Scalars['Date']>;
  endTime?: Maybe<Scalars['Time']>;
  periods?: Maybe<Array<Maybe<Scalars['Int']>>>;
  startTime?: Maybe<Scalars['Time']>;
  state?: Maybe<Scalars['String']>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

export type PeriodType = {
  __typename?: 'PeriodType';
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  endDate?: Maybe<Scalars['Date']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  periodId?: Maybe<Scalars['Int']>;
  resourceState?: Maybe<Scalars['String']>;
  startDate?: Maybe<Scalars['Date']>;
  timeSpans?: Maybe<Array<Maybe<TimeSpanType>>>;
};

export type PurposeCreateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};

export type PurposeCreateMutationPayload = {
  __typename?: 'PurposeCreateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  purpose?: Maybe<PurposeType>;
};

export type PurposeType = Node & {
  __typename?: 'PurposeType';
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type PurposeTypeConnection = {
  __typename?: 'PurposeTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<PurposeTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `PurposeType` and its cursor. */
export type PurposeTypeEdge = {
  __typename?: 'PurposeTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<PurposeType>;
};

export type PurposeUpdateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
};

export type PurposeUpdateMutationPayload = {
  __typename?: 'PurposeUpdateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  purpose?: Maybe<PurposeType>;
};

export type Query = {
  __typename?: 'Query';
  /** The ID of the object */
  equipment?: Maybe<EquipmentType>;
  equipmentByPk?: Maybe<EquipmentType>;
  equipmentCategories?: Maybe<EquipmentCategoryTypeConnection>;
  /** The ID of the object */
  equipmentCategory?: Maybe<EquipmentCategoryType>;
  equipmentCategoryByPk?: Maybe<EquipmentCategoryType>;
  equipments?: Maybe<EquipmentTypeConnection>;
  keywordCategories?: Maybe<KeywordCategoryTypeConnection>;
  keywordGroups?: Maybe<KeywordGroupTypeConnection>;
  keywords?: Maybe<KeywordTypeConnection>;
  purposes?: Maybe<PurposeTypeConnection>;
  /** The ID of the object */
  reservationUnit?: Maybe<ReservationUnitType>;
  reservationUnitByPk?: Maybe<ReservationUnitByPkType>;
  reservationUnits?: Maybe<ReservationUnitTypeConnection>;
  /** The ID of the object */
  resource?: Maybe<ResourceType>;
  resourceByPk?: Maybe<ResourceType>;
  resources?: Maybe<ResourceTypeConnection>;
  /** The ID of the object */
  space?: Maybe<SpaceType>;
  spaceByPk?: Maybe<SpaceType>;
  spaces?: Maybe<SpaceTypeConnection>;
  /** The ID of the object */
  unit?: Maybe<UnitType>;
  unitByPk?: Maybe<UnitByPkType>;
  units?: Maybe<UnitTypeConnection>;
};


export type QueryEquipmentArgs = {
  id: Scalars['ID'];
};


export type QueryEquipmentByPkArgs = {
  pk?: Maybe<Scalars['Int']>;
};


export type QueryEquipmentCategoriesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameEn_Icontains?: Maybe<Scalars['String']>;
  nameEn_Istartswith?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameFi_Icontains?: Maybe<Scalars['String']>;
  nameFi_Istartswith?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  nameSv_Icontains?: Maybe<Scalars['String']>;
  nameSv_Istartswith?: Maybe<Scalars['String']>;
};


export type QueryEquipmentCategoryArgs = {
  id: Scalars['ID'];
};


export type QueryEquipmentCategoryByPkArgs = {
  pk?: Maybe<Scalars['Int']>;
};


export type QueryEquipmentsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameEn_Icontains?: Maybe<Scalars['String']>;
  nameEn_Istartswith?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameFi_Icontains?: Maybe<Scalars['String']>;
  nameFi_Istartswith?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  nameSv_Icontains?: Maybe<Scalars['String']>;
  nameSv_Istartswith?: Maybe<Scalars['String']>;
};


export type QueryKeywordCategoriesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};


export type QueryKeywordGroupsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};


export type QueryKeywordsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};


export type QueryPurposesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
};


export type QueryReservationUnitArgs = {
  id: Scalars['ID'];
};


export type QueryReservationUnitByPkArgs = {
  pk?: Maybe<Scalars['Int']>;
};


export type QueryReservationUnitsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  keywordGroups?: Maybe<Scalars['ID']>;
  last?: Maybe<Scalars['Int']>;
  maxPersonsGte?: Maybe<Scalars['Float']>;
  maxPersonsLte?: Maybe<Scalars['Float']>;
  reservationUnitType?: Maybe<Scalars['ID']>;
  textSearch?: Maybe<Scalars['String']>;
  unit?: Maybe<Scalars['ID']>;
};


export type QueryResourceArgs = {
  id: Scalars['ID'];
};


export type QueryResourceByPkArgs = {
  pk?: Maybe<Scalars['Int']>;
};


export type QueryResourcesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameEn_Icontains?: Maybe<Scalars['String']>;
  nameEn_Istartswith?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameFi_Icontains?: Maybe<Scalars['String']>;
  nameFi_Istartswith?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  nameSv_Icontains?: Maybe<Scalars['String']>;
  nameSv_Istartswith?: Maybe<Scalars['String']>;
};


export type QuerySpaceArgs = {
  id: Scalars['ID'];
};


export type QuerySpaceByPkArgs = {
  pk?: Maybe<Scalars['Int']>;
};


export type QuerySpacesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameEn_Icontains?: Maybe<Scalars['String']>;
  nameEn_Istartswith?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameFi_Icontains?: Maybe<Scalars['String']>;
  nameFi_Istartswith?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  nameSv_Icontains?: Maybe<Scalars['String']>;
  nameSv_Istartswith?: Maybe<Scalars['String']>;
};


export type QueryUnitArgs = {
  id: Scalars['ID'];
};


export type QueryUnitByPkArgs = {
  pk?: Maybe<Scalars['Int']>;
};


export type QueryUnitsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameEn_Icontains?: Maybe<Scalars['String']>;
  nameEn_Istartswith?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameFi_Icontains?: Maybe<Scalars['String']>;
  nameFi_Istartswith?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  nameSv_Icontains?: Maybe<Scalars['String']>;
  nameSv_Istartswith?: Maybe<Scalars['String']>;
};

export type RealEstateType = Node & {
  __typename?: 'RealEstateType';
  district?: Maybe<DistrictType>;
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  surfaceArea?: Maybe<Scalars['Float']>;
};

export type ReservationMutationInput = {
  begin: Scalars['DateTime'];
  bufferTimeAfter?: Maybe<Scalars['String']>;
  bufferTimeBefore?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  end: Scalars['DateTime'];
  id?: Maybe<Scalars['ID']>;
  priority: Scalars['String'];
  reservationUnit: Array<Maybe<Scalars['ID']>>;
  state: Scalars['String'];
  user: Scalars['ID'];
};

export type ReservationMutationPayload = {
  __typename?: 'ReservationMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  reservation?: Maybe<ReservationType>;
};

/** An enumeration. */
export enum ReservationPriority {
  /** Low */
  A_100 = 'A_100',
  /** Medium */
  A_200 = 'A_200',
  /** High */
  A_300 = 'A_300'
}

/** An enumeration. */
export enum ReservationState {
  /** cancelled */
  Cancelled = 'CANCELLED',
  /** confirmed */
  Confirmed = 'CONFIRMED',
  /** created */
  Created = 'CREATED',
  /** denied */
  Denied = 'DENIED',
  /** requested */
  Requested = 'REQUESTED',
  /** waiting for payment */
  WaitingForPayment = 'WAITING_FOR_PAYMENT'
}

export type ReservationType = Node & {
  __typename?: 'ReservationType';
  begin: Scalars['DateTime'];
  bufferTimeAfter?: Maybe<Scalars['Float']>;
  bufferTimeBefore?: Maybe<Scalars['Float']>;
  calendarUrl?: Maybe<Scalars['String']>;
  end: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  numPersons?: Maybe<Scalars['Int']>;
  pk?: Maybe<Scalars['Int']>;
  priority: ReservationPriority;
  reservationUnit: ReservationUnitByPkTypeConnection;
  state: ReservationState;
};


export type ReservationTypeReservationUnitArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type ReservationUnitByPkType = Node & {
  __typename?: 'ReservationUnitByPkType';
  applicationRounds?: Maybe<Array<Maybe<ApplicationRoundType>>>;
  contactInformationEn?: Maybe<Scalars['String']>;
  contactInformationFi?: Maybe<Scalars['String']>;
  contactInformationSv?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  equipment?: Maybe<Array<Maybe<EquipmentType>>>;
  haukiUrl?: Maybe<ReservationUnitHaukiUrlType>;
  /** The ID of the object. */
  id: Scalars['ID'];
  images?: Maybe<Array<Maybe<ReservationUnitImageType>>>;
  keywordGroups?: Maybe<Array<Maybe<KeywordGroupType>>>;
  location?: Maybe<LocationType>;
  maxPersons?: Maybe<Scalars['Int']>;
  maxReservationDuration?: Maybe<Scalars['Time']>;
  minReservationDuration?: Maybe<Scalars['Time']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  nextAvailableSlot?: Maybe<Scalars['DateTime']>;
  openingHours?: Maybe<OpeningHoursType>;
  pk?: Maybe<Scalars['Int']>;
  purposes?: Maybe<Array<Maybe<PurposeType>>>;
  requireIntroduction: Scalars['Boolean'];
  reservationUnitType?: Maybe<ReservationUnitTypeType>;
  reservations?: Maybe<Array<Maybe<ReservationType>>>;
  resources?: Maybe<Array<Maybe<ResourceType>>>;
  services?: Maybe<Array<Maybe<ServiceType>>>;
  spaces?: Maybe<Array<Maybe<SpaceType>>>;
  surfaceArea?: Maybe<Scalars['Int']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unit?: Maybe<UnitType>;
  uuid: Scalars['UUID'];
};


export type ReservationUnitByPkTypeApplicationRoundsArgs = {
  active?: Maybe<Scalars['Boolean']>;
};


export type ReservationUnitByPkTypeOpeningHoursArgs = {
  endDate?: Maybe<Scalars['Date']>;
  openingTimes?: Maybe<Scalars['Boolean']>;
  periods?: Maybe<Scalars['Boolean']>;
  startDate?: Maybe<Scalars['Date']>;
};


export type ReservationUnitByPkTypeReservationsArgs = {
  from?: Maybe<Scalars['Date']>;
  state?: Maybe<Array<Maybe<Scalars['String']>>>;
  to?: Maybe<Scalars['Date']>;
};

export type ReservationUnitByPkTypeConnection = {
  __typename?: 'ReservationUnitByPkTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ReservationUnitByPkTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ReservationUnitByPkType` and its cursor. */
export type ReservationUnitByPkTypeEdge = {
  __typename?: 'ReservationUnitByPkTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ReservationUnitByPkType>;
};

export type ReservationUnitCreateMutationInput = {
  bufferTimeBetweenReservations?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  contactInformationEn?: Maybe<Scalars['String']>;
  contactInformationFi?: Maybe<Scalars['String']>;
  contactInformationSv?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  equipmentIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  isDraft?: Maybe<Scalars['Boolean']>;
  maxPersons?: Maybe<Scalars['Int']>;
  maxReservationDuration?: Maybe<Scalars['String']>;
  minReservationDuration?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  purposeIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Determines if introduction is required in order to reserve this reservation unit. */
  requireIntroduction?: Maybe<Scalars['Boolean']>;
  reservationUnitTypeId?: Maybe<Scalars['String']>;
  resourceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  serviceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  spaceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId: Scalars['String'];
};

export type ReservationUnitCreateMutationPayload = {
  __typename?: 'ReservationUnitCreateMutationPayload';
  bufferTimeBetweenReservations?: Maybe<Scalars['String']>;
  building?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  contactInformationEn?: Maybe<Scalars['String']>;
  contactInformationFi?: Maybe<Scalars['String']>;
  contactInformationSv?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  equipmentIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  /** Images of the reservation unit as nested related objects.  */
  images?: Maybe<Array<Maybe<ReservationUnitImageType>>>;
  isDraft?: Maybe<Scalars['Boolean']>;
  /** Location of this reservation unit. Dynamically determined from spaces of the reservation unit. */
  location?: Maybe<Scalars['String']>;
  maxPersons?: Maybe<Scalars['Int']>;
  maxReservationDuration?: Maybe<Scalars['String']>;
  minReservationDuration?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  purposeIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  purposes?: Maybe<Array<Maybe<PurposeType>>>;
  /** Determines if introduction is required in order to reserve this reservation unit. */
  requireIntroduction?: Maybe<Scalars['Boolean']>;
  reservationUnit?: Maybe<ReservationUnitType>;
  /** Type of the reservation unit as nested related object. */
  reservationUnitType?: Maybe<ReservationUnitTypeType>;
  reservationUnitTypeId?: Maybe<Scalars['String']>;
  resourceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Resources included in the reservation unit as nested related objects. */
  resources?: Maybe<Array<Maybe<ResourceType>>>;
  serviceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Services included in the reservation unit as nested related objects. */
  services?: Maybe<Array<Maybe<ServiceType>>>;
  spaceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Spaces included in the reservation unit as nested related objects. */
  spaces?: Maybe<Array<Maybe<SpaceType>>>;
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
  uuid?: Maybe<Scalars['String']>;
};

export type ReservationUnitHaukiUrlType = {
  __typename?: 'ReservationUnitHaukiUrlType';
  url?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum ReservationUnitImageImageType {
  /** Ground plan */
  GroundPlan = 'GROUND_PLAN',
  /** Main image */
  Main = 'MAIN',
  /** Map */
  Map = 'MAP',
  /** Other */
  Other = 'OTHER'
}

export type ReservationUnitImageType = {
  __typename?: 'ReservationUnitImageType';
  imageType: ReservationUnitImageImageType;
  imageUrl?: Maybe<Scalars['String']>;
  mediumUrl?: Maybe<Scalars['String']>;
  smallUrl?: Maybe<Scalars['String']>;
};

export type ReservationUnitType = Node & {
  __typename?: 'ReservationUnitType';
  applicationRounds?: Maybe<Array<Maybe<ApplicationRoundType>>>;
  bufferTimeBetweenReservations?: Maybe<Scalars['Float']>;
  contactInformationEn?: Maybe<Scalars['String']>;
  contactInformationFi?: Maybe<Scalars['String']>;
  contactInformationSv?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  equipment?: Maybe<Array<Maybe<EquipmentType>>>;
  /** The ID of the object. */
  id: Scalars['ID'];
  images?: Maybe<Array<Maybe<ReservationUnitImageType>>>;
  isDraft: Scalars['Boolean'];
  keywordGroups?: Maybe<Array<Maybe<KeywordGroupType>>>;
  location?: Maybe<LocationType>;
  maxPersons?: Maybe<Scalars['Int']>;
  maxReservationDuration?: Maybe<Scalars['Time']>;
  minReservationDuration?: Maybe<Scalars['Time']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  purposes?: Maybe<Array<Maybe<PurposeType>>>;
  requireIntroduction: Scalars['Boolean'];
  reservationUnitType?: Maybe<ReservationUnitTypeType>;
  reservations?: Maybe<Array<Maybe<ReservationType>>>;
  resources?: Maybe<Array<Maybe<ResourceType>>>;
  services?: Maybe<Array<Maybe<ServiceType>>>;
  spaces?: Maybe<Array<Maybe<SpaceType>>>;
  surfaceArea?: Maybe<Scalars['Int']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unit?: Maybe<UnitType>;
  uuid: Scalars['UUID'];
};


export type ReservationUnitTypeApplicationRoundsArgs = {
  active?: Maybe<Scalars['Boolean']>;
};


export type ReservationUnitTypeReservationsArgs = {
  from?: Maybe<Scalars['Date']>;
  state?: Maybe<Array<Maybe<Scalars['String']>>>;
  to?: Maybe<Scalars['Date']>;
};

export type ReservationUnitTypeConnection = {
  __typename?: 'ReservationUnitTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ReservationUnitTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ReservationUnitType` and its cursor. */
export type ReservationUnitTypeEdge = {
  __typename?: 'ReservationUnitTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ReservationUnitType>;
};

export type ReservationUnitTypeType = Node & {
  __typename?: 'ReservationUnitTypeType';
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
};

export type ReservationUnitUpdateMutationInput = {
  bufferTimeBetweenReservations?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  contactInformationEn?: Maybe<Scalars['String']>;
  contactInformationFi?: Maybe<Scalars['String']>;
  contactInformationSv?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  equipmentIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  isDraft?: Maybe<Scalars['Boolean']>;
  maxPersons?: Maybe<Scalars['Int']>;
  maxReservationDuration?: Maybe<Scalars['String']>;
  minReservationDuration?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
  purposeIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Determines if introduction is required in order to reserve this reservation unit. */
  requireIntroduction?: Maybe<Scalars['Boolean']>;
  reservationUnitTypeId?: Maybe<Scalars['String']>;
  resourceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  serviceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  spaceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
};

export type ReservationUnitUpdateMutationPayload = {
  __typename?: 'ReservationUnitUpdateMutationPayload';
  bufferTimeBetweenReservations?: Maybe<Scalars['String']>;
  building?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  contactInformationEn?: Maybe<Scalars['String']>;
  contactInformationFi?: Maybe<Scalars['String']>;
  contactInformationSv?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  equipmentIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  /** Images of the reservation unit as nested related objects.  */
  images?: Maybe<Array<Maybe<ReservationUnitImageType>>>;
  isDraft?: Maybe<Scalars['Boolean']>;
  /** Location of this reservation unit. Dynamically determined from spaces of the reservation unit. */
  location?: Maybe<Scalars['String']>;
  maxPersons?: Maybe<Scalars['Int']>;
  maxReservationDuration?: Maybe<Scalars['String']>;
  minReservationDuration?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  purposeIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  purposes?: Maybe<Array<Maybe<PurposeType>>>;
  /** Determines if introduction is required in order to reserve this reservation unit. */
  requireIntroduction?: Maybe<Scalars['Boolean']>;
  reservationUnit?: Maybe<ReservationUnitType>;
  /** Type of the reservation unit as nested related object. */
  reservationUnitType?: Maybe<ReservationUnitTypeType>;
  reservationUnitTypeId?: Maybe<Scalars['String']>;
  resourceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Resources included in the reservation unit as nested related objects. */
  resources?: Maybe<Array<Maybe<ResourceType>>>;
  serviceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Services included in the reservation unit as nested related objects. */
  services?: Maybe<Array<Maybe<ServiceType>>>;
  spaceIds?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** Spaces included in the reservation unit as nested related objects. */
  spaces?: Maybe<Array<Maybe<SpaceType>>>;
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
  uuid?: Maybe<Scalars['String']>;
};

export type ResourceCreateMutationInput = {
  /** Begin date and time of the reservation. */
  bufferTimeAfter?: Maybe<Scalars['String']>;
  /**
   * Buffer time while reservation unit is unreservable after the reservation.
   * Dynamically calculated from spaces and resources.
   */
  bufferTimeBefore?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  locationType?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  /** Id of related space for this resource. */
  spaceId?: Maybe<Scalars['String']>;
};

export type ResourceCreateMutationPayload = {
  __typename?: 'ResourceCreateMutationPayload';
  /** Begin date and time of the reservation. */
  bufferTimeAfter?: Maybe<Scalars['String']>;
  /**
   * Buffer time while reservation unit is unreservable after the reservation.
   * Dynamically calculated from spaces and resources.
   */
  bufferTimeBefore?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  locationType?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  resource?: Maybe<ResourceType>;
  /** Id of related space for this resource. */
  spaceId?: Maybe<Scalars['String']>;
};

export type ResourceDeleteMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['ID']>;
};

export type ResourceDeleteMutationPayload = {
  __typename?: 'ResourceDeleteMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  errors?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum ResourceLocationType {
  /** Fixed */
  Fixed = 'FIXED',
  /** Movable */
  Movable = 'MOVABLE'
}

export type ResourceType = Node & {
  __typename?: 'ResourceType';
  bufferTimeAfter?: Maybe<Scalars['Float']>;
  bufferTimeBefore?: Maybe<Scalars['Float']>;
  building?: Maybe<Array<Maybe<BuildingType>>>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  isDraft: Scalars['Boolean'];
  locationType: ResourceLocationType;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  space?: Maybe<SpaceType>;
};

export type ResourceTypeConnection = {
  __typename?: 'ResourceTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ResourceTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `ResourceType` and its cursor. */
export type ResourceTypeEdge = {
  __typename?: 'ResourceTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<ResourceType>;
};

export type ResourceUpdateMutationInput = {
  /** Begin date and time of the reservation. */
  bufferTimeAfter?: Maybe<Scalars['String']>;
  /**
   * Buffer time while reservation unit is unreservable after the reservation.
   * Dynamically calculated from spaces and resources.
   */
  bufferTimeBefore?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  locationType?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
  /** Id of related space for this resource. */
  spaceId?: Maybe<Scalars['String']>;
};

export type ResourceUpdateMutationPayload = {
  __typename?: 'ResourceUpdateMutationPayload';
  /** Begin date and time of the reservation. */
  bufferTimeAfter?: Maybe<Scalars['String']>;
  /**
   * Buffer time while reservation unit is unreservable after the reservation.
   * Dynamically calculated from spaces and resources.
   */
  bufferTimeBefore?: Maybe<Scalars['String']>;
  clientMutationId?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  isDraft?: Maybe<Scalars['Boolean']>;
  locationType?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  resource?: Maybe<ResourceType>;
  /** Id of related space for this resource. */
  spaceId?: Maybe<Scalars['String']>;
};

/** An enumeration. */
export enum ServiceServiceType {
  /** Catering */
  Catering = 'CATERING',
  /** Configuration */
  Configuration = 'CONFIGURATION',
  /** Introduction */
  Introduction = 'INTRODUCTION'
}

export type ServiceType = Node & {
  __typename?: 'ServiceType';
  bufferTimeAfter?: Maybe<Scalars['String']>;
  bufferTimeBefore?: Maybe<Scalars['String']>;
  /** The ID of the object. */
  id: Scalars['ID'];
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  serviceType: ServiceServiceType;
};

export type SpaceCreateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  /** Id of district for this space. */
  districtId?: Maybe<Scalars['String']>;
  maxPersons?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi: Scalars['String'];
  nameSv?: Maybe<Scalars['String']>;
  /** Id of parent space for this space. */
  parentId?: Maybe<Scalars['String']>;
  /** Surface area of the space as square meters */
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
};

export type SpaceCreateMutationPayload = {
  __typename?: 'SpaceCreateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  /** Id of district for this space. */
  districtId?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  maxPersons?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  /** Id of parent space for this space. */
  parentId?: Maybe<Scalars['String']>;
  space?: Maybe<SpaceType>;
  /** Surface area of the space as square meters */
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
};

export type SpaceDeleteMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['ID']>;
};

export type SpaceDeleteMutationPayload = {
  __typename?: 'SpaceDeleteMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  deleted?: Maybe<Scalars['Boolean']>;
  errors?: Maybe<Scalars['String']>;
};

export type SpaceType = Node & {
  __typename?: 'SpaceType';
  building?: Maybe<BuildingType>;
  children?: Maybe<Array<Maybe<SpaceType>>>;
  code: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  maxPersons?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  parent?: Maybe<SpaceType>;
  pk?: Maybe<Scalars['Int']>;
  resources?: Maybe<Array<Maybe<ResourceType>>>;
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unit?: Maybe<UnitByPkType>;
};

export type SpaceTypeConnection = {
  __typename?: 'SpaceTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<SpaceTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `SpaceType` and its cursor. */
export type SpaceTypeEdge = {
  __typename?: 'SpaceTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<SpaceType>;
};

export type SpaceUpdateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  /** Id of district for this space. */
  districtId?: Maybe<Scalars['String']>;
  maxPersons?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  /** Id of parent space for this space. */
  parentId?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
  /** Surface area of the space as square meters */
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
};

export type SpaceUpdateMutationPayload = {
  __typename?: 'SpaceUpdateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  /** Id of district for this space. */
  districtId?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  maxPersons?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  /** Id of parent space for this space. */
  parentId?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  space?: Maybe<SpaceType>;
  /** Surface area of the space as square meters */
  surfaceArea?: Maybe<Scalars['Float']>;
  termsOfUseEn?: Maybe<Scalars['String']>;
  termsOfUseFi?: Maybe<Scalars['String']>;
  termsOfUseSv?: Maybe<Scalars['String']>;
  unitId?: Maybe<Scalars['String']>;
};

export type TimeSpanType = {
  __typename?: 'TimeSpanType';
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  endTime?: Maybe<Scalars['Time']>;
  endTimeOnNextDay?: Maybe<Scalars['Boolean']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  resourceState?: Maybe<Scalars['String']>;
  startTime?: Maybe<Scalars['Time']>;
  weekdays?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type UnitByPkType = Node & {
  __typename?: 'UnitByPkType';
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  location?: Maybe<LocationType>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  openingHours?: Maybe<OpeningHoursType>;
  phone: Scalars['String'];
  pk?: Maybe<Scalars['Int']>;
  reservationUnits?: Maybe<Array<Maybe<ReservationUnitType>>>;
  shortDescriptionEn?: Maybe<Scalars['String']>;
  shortDescriptionFi?: Maybe<Scalars['String']>;
  shortDescriptionSv?: Maybe<Scalars['String']>;
  spaces?: Maybe<Array<Maybe<SpaceType>>>;
  tprekId?: Maybe<Scalars['String']>;
  webPage: Scalars['String'];
};


export type UnitByPkTypeOpeningHoursArgs = {
  endDate?: Maybe<Scalars['Date']>;
  openingTimes?: Maybe<Scalars['Boolean']>;
  periods?: Maybe<Scalars['Boolean']>;
  startDate?: Maybe<Scalars['Date']>;
};

export type UnitType = Node & {
  __typename?: 'UnitType';
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  /** The ID of the object. */
  id: Scalars['ID'];
  location?: Maybe<LocationType>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  phone: Scalars['String'];
  pk?: Maybe<Scalars['Int']>;
  reservationUnits?: Maybe<Array<Maybe<ReservationUnitType>>>;
  shortDescriptionEn?: Maybe<Scalars['String']>;
  shortDescriptionFi?: Maybe<Scalars['String']>;
  shortDescriptionSv?: Maybe<Scalars['String']>;
  spaces?: Maybe<Array<Maybe<SpaceType>>>;
  tprekId?: Maybe<Scalars['String']>;
  webPage: Scalars['String'];
};

export type UnitTypeConnection = {
  __typename?: 'UnitTypeConnection';
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<UnitTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
};

/** A Relay edge containing a `UnitType` and its cursor. */
export type UnitTypeEdge = {
  __typename?: 'UnitTypeEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node?: Maybe<UnitType>;
};

export type UnitUpdateMutationInput = {
  clientMutationId?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  pk: Scalars['Int'];
  shortDescriptionEn?: Maybe<Scalars['String']>;
  shortDescriptionFi?: Maybe<Scalars['String']>;
  shortDescriptionSv?: Maybe<Scalars['String']>;
  tprekId?: Maybe<Scalars['String']>;
  webPage?: Maybe<Scalars['String']>;
};

export type UnitUpdateMutationPayload = {
  __typename?: 'UnitUpdateMutationPayload';
  clientMutationId?: Maybe<Scalars['String']>;
  descriptionEn?: Maybe<Scalars['String']>;
  descriptionFi?: Maybe<Scalars['String']>;
  descriptionSv?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  /** May contain more than one error for same field. */
  errors?: Maybe<Array<Maybe<ErrorType>>>;
  id?: Maybe<Scalars['Int']>;
  nameEn?: Maybe<Scalars['String']>;
  nameFi?: Maybe<Scalars['String']>;
  nameSv?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  pk?: Maybe<Scalars['Int']>;
  shortDescriptionEn?: Maybe<Scalars['String']>;
  shortDescriptionFi?: Maybe<Scalars['String']>;
  shortDescriptionSv?: Maybe<Scalars['String']>;
  tprekId?: Maybe<Scalars['String']>;
  unit?: Maybe<UnitType>;
  webPage?: Maybe<Scalars['String']>;
};


export const SearchFormParamsDocument = gql`
    query SearchFormParams {
  units {
    edges {
      node {
        pk
        nameFi
        nameEn
        nameSv
      }
    }
  }
}
    `;

/**
 * __useSearchFormParamsQuery__
 *
 * To run a query within a React component, call `useSearchFormParamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchFormParamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchFormParamsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSearchFormParamsQuery(baseOptions?: Apollo.QueryHookOptions<SearchFormParamsQuery, SearchFormParamsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchFormParamsQuery, SearchFormParamsQueryVariables>(SearchFormParamsDocument, options);
      }
export function useSearchFormParamsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchFormParamsQuery, SearchFormParamsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchFormParamsQuery, SearchFormParamsQueryVariables>(SearchFormParamsDocument, options);
        }
export type SearchFormParamsQueryHookResult = ReturnType<typeof useSearchFormParamsQuery>;
export type SearchFormParamsLazyQueryHookResult = ReturnType<typeof useSearchFormParamsLazyQuery>;
export type SearchFormParamsQueryResult = Apollo.QueryResult<SearchFormParamsQuery, SearchFormParamsQueryVariables>;
export const ReservationUnitRecurringDocument = gql`
    query ReservationUnitRecurring($pk: Int!) {
  reservationUnitByPk(pk: $pk) {
    id
    pk
    nameFi
    nameEn
    nameSv
    images {
      imageUrl
      mediumUrl
      smallUrl
      imageType
    }
    descriptionFi
    descriptionEn
    descriptionSv
    termsOfUseFi
    termsOfUseEn
    termsOfUseSv
    reservationUnitType {
      nameFi
      nameEn
      nameSv
    }
    maxPersons
    unit {
      id
      pk
      nameFi
      nameEn
      nameSv
    }
    location {
      latitude
      longitude
      addressStreetFi
      addressStreetEn
      addressStreetSv
      addressZip
      addressCityFi
      addressCityEn
      addressCitySv
    }
    spaces {
      pk
      nameFi
      nameEn
      nameSv
      termsOfUseFi
      termsOfUseEn
      termsOfUseSv
    }
    openingHours(openingTimes: false, periods: true) {
      openingTimePeriods {
        periodId
        startDate
        endDate
        resourceState
        timeSpans {
          startTime
          endTime
          resourceState
          weekdays
        }
      }
    }
  }
}
    `;

/**
 * __useReservationUnitRecurringQuery__
 *
 * To run a query within a React component, call `useReservationUnitRecurringQuery` and pass it any options that fit your needs.
 * When your component renders, `useReservationUnitRecurringQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReservationUnitRecurringQuery({
 *   variables: {
 *      pk: // value for 'pk'
 *   },
 * });
 */
export function useReservationUnitRecurringQuery(baseOptions: Apollo.QueryHookOptions<ReservationUnitRecurringQuery, ReservationUnitRecurringQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReservationUnitRecurringQuery, ReservationUnitRecurringQueryVariables>(ReservationUnitRecurringDocument, options);
      }
export function useReservationUnitRecurringLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReservationUnitRecurringQuery, ReservationUnitRecurringQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReservationUnitRecurringQuery, ReservationUnitRecurringQueryVariables>(ReservationUnitRecurringDocument, options);
        }
export type ReservationUnitRecurringQueryHookResult = ReturnType<typeof useReservationUnitRecurringQuery>;
export type ReservationUnitRecurringLazyQueryHookResult = ReturnType<typeof useReservationUnitRecurringLazyQuery>;
export type ReservationUnitRecurringQueryResult = Apollo.QueryResult<ReservationUnitRecurringQuery, ReservationUnitRecurringQueryVariables>;
export const RelatedReservationUnitsDocument = gql`
    query RelatedReservationUnits($unit: ID) {
  reservationUnits(unit: $unit) {
    edges {
      node {
        pk
        nameFi
        nameEn
        nameSv
        images {
          imageUrl
          smallUrl
          imageType
        }
        unit {
          pk
          nameFi
          nameEn
          nameSv
        }
        reservationUnitType {
          nameFi
          nameEn
          nameSv
        }
        maxPersons
        location {
          addressStreetFi
          addressStreetEn
          addressStreetSv
        }
      }
    }
  }
}
    `;

/**
 * __useRelatedReservationUnitsQuery__
 *
 * To run a query within a React component, call `useRelatedReservationUnitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRelatedReservationUnitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRelatedReservationUnitsQuery({
 *   variables: {
 *      unit: // value for 'unit'
 *   },
 * });
 */
export function useRelatedReservationUnitsQuery(baseOptions?: Apollo.QueryHookOptions<RelatedReservationUnitsQuery, RelatedReservationUnitsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RelatedReservationUnitsQuery, RelatedReservationUnitsQueryVariables>(RelatedReservationUnitsDocument, options);
      }
export function useRelatedReservationUnitsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RelatedReservationUnitsQuery, RelatedReservationUnitsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RelatedReservationUnitsQuery, RelatedReservationUnitsQueryVariables>(RelatedReservationUnitsDocument, options);
        }
export type RelatedReservationUnitsQueryHookResult = ReturnType<typeof useRelatedReservationUnitsQuery>;
export type RelatedReservationUnitsLazyQueryHookResult = ReturnType<typeof useRelatedReservationUnitsLazyQuery>;
export type RelatedReservationUnitsQueryResult = Apollo.QueryResult<RelatedReservationUnitsQuery, RelatedReservationUnitsQueryVariables>;
export const SelectedReservationUnitDocument = gql`
    query SelectedReservationUnit($pk: Int) {
  reservationUnitByPk(pk: $pk) {
    pk
    nameFi
    nameEn
    nameSv
    unit {
      nameFi
      nameEn
      nameSv
    }
  }
}
    `;

/**
 * __useSelectedReservationUnitQuery__
 *
 * To run a query within a React component, call `useSelectedReservationUnitQuery` and pass it any options that fit your needs.
 * When your component renders, `useSelectedReservationUnitQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSelectedReservationUnitQuery({
 *   variables: {
 *      pk: // value for 'pk'
 *   },
 * });
 */
export function useSelectedReservationUnitQuery(baseOptions?: Apollo.QueryHookOptions<SelectedReservationUnitQuery, SelectedReservationUnitQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SelectedReservationUnitQuery, SelectedReservationUnitQueryVariables>(SelectedReservationUnitDocument, options);
      }
export function useSelectedReservationUnitLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SelectedReservationUnitQuery, SelectedReservationUnitQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SelectedReservationUnitQuery, SelectedReservationUnitQueryVariables>(SelectedReservationUnitDocument, options);
        }
export type SelectedReservationUnitQueryHookResult = ReturnType<typeof useSelectedReservationUnitQuery>;
export type SelectedReservationUnitLazyQueryHookResult = ReturnType<typeof useSelectedReservationUnitLazyQuery>;
export type SelectedReservationUnitQueryResult = Apollo.QueryResult<SelectedReservationUnitQuery, SelectedReservationUnitQueryVariables>;
export const ReservationUnitSingleDocument = gql`
    query ReservationUnitSingle($pk: Int!) {
  reservationUnitByPk(pk: $pk) {
    id
    pk
    nameFi
    nameEn
    nameSv
    images {
      imageUrl
      mediumUrl
      smallUrl
      imageType
    }
    descriptionFi
    descriptionEn
    descriptionSv
    termsOfUseFi
    termsOfUseEn
    termsOfUseSv
    reservationUnitType {
      nameFi
      nameEn
      nameSv
    }
    maxPersons
    unit {
      id
      pk
      nameFi
      nameEn
      nameSv
    }
    location {
      latitude
      longitude
      addressStreetFi
      addressStreetEn
      addressStreetSv
      addressZip
      addressCityFi
      addressCityEn
      addressCitySv
    }
    minReservationDuration
    maxReservationDuration
    nextAvailableSlot
    spaces {
      pk
      nameFi
      nameEn
      nameSv
      termsOfUseFi
      termsOfUseEn
      termsOfUseSv
    }
    openingHours(openingTimes: false, periods: true) {
      openingTimePeriods {
        periodId
        startDate
        endDate
        resourceState
        timeSpans {
          startTime
          endTime
          resourceState
          weekdays
        }
      }
    }
  }
}
    `;

/**
 * __useReservationUnitSingleQuery__
 *
 * To run a query within a React component, call `useReservationUnitSingleQuery` and pass it any options that fit your needs.
 * When your component renders, `useReservationUnitSingleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReservationUnitSingleQuery({
 *   variables: {
 *      pk: // value for 'pk'
 *   },
 * });
 */
export function useReservationUnitSingleQuery(baseOptions: Apollo.QueryHookOptions<ReservationUnitSingleQuery, ReservationUnitSingleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReservationUnitSingleQuery, ReservationUnitSingleQueryVariables>(ReservationUnitSingleDocument, options);
      }
export function useReservationUnitSingleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReservationUnitSingleQuery, ReservationUnitSingleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReservationUnitSingleQuery, ReservationUnitSingleQueryVariables>(ReservationUnitSingleDocument, options);
        }
export type ReservationUnitSingleQueryHookResult = ReturnType<typeof useReservationUnitSingleQuery>;
export type ReservationUnitSingleLazyQueryHookResult = ReturnType<typeof useReservationUnitSingleLazyQuery>;
export type ReservationUnitSingleQueryResult = Apollo.QueryResult<ReservationUnitSingleQuery, ReservationUnitSingleQueryVariables>;
export const ReservationUnitOpeningHoursDocument = gql`
    query ReservationUnitOpeningHours($pk: Int, $startDate: Date, $endDate: Date, $from: Date, $to: Date, $state: [String]) {
  reservationUnitByPk(pk: $pk) {
    openingHours(
      openingTimes: true
      periods: false
      startDate: $startDate
      endDate: $endDate
    ) {
      openingTimes {
        date
        startTime
        endTime
        state
        periods
      }
    }
    reservations(state: $state, from: $from, to: $to) {
      pk
      state
      priority
      begin
      end
      numPersons
      calendarUrl
    }
  }
}
    `;

/**
 * __useReservationUnitOpeningHoursQuery__
 *
 * To run a query within a React component, call `useReservationUnitOpeningHoursQuery` and pass it any options that fit your needs.
 * When your component renders, `useReservationUnitOpeningHoursQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReservationUnitOpeningHoursQuery({
 *   variables: {
 *      pk: // value for 'pk'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      from: // value for 'from'
 *      to: // value for 'to'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useReservationUnitOpeningHoursQuery(baseOptions?: Apollo.QueryHookOptions<ReservationUnitOpeningHoursQuery, ReservationUnitOpeningHoursQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReservationUnitOpeningHoursQuery, ReservationUnitOpeningHoursQueryVariables>(ReservationUnitOpeningHoursDocument, options);
      }
export function useReservationUnitOpeningHoursLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReservationUnitOpeningHoursQuery, ReservationUnitOpeningHoursQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReservationUnitOpeningHoursQuery, ReservationUnitOpeningHoursQueryVariables>(ReservationUnitOpeningHoursDocument, options);
        }
export type ReservationUnitOpeningHoursQueryHookResult = ReturnType<typeof useReservationUnitOpeningHoursQuery>;
export type ReservationUnitOpeningHoursLazyQueryHookResult = ReturnType<typeof useReservationUnitOpeningHoursLazyQuery>;
export type ReservationUnitOpeningHoursQueryResult = Apollo.QueryResult<ReservationUnitOpeningHoursQuery, ReservationUnitOpeningHoursQueryVariables>;
export const SearchReservationUnitsDocument = gql`
    query SearchReservationUnits($textSearch: String, $minPersons: Float, $maxPersons: Float, $unit: ID, $reservationUnitType: ID, $first: Int, $after: String) {
  reservationUnits(
    textSearch: $textSearch
    maxPersonsGte: $minPersons
    maxPersonsLte: $maxPersons
    reservationUnitType: $reservationUnitType
    unit: $unit
    first: $first
    after: $after
  ) {
    edges {
      node {
        id: pk
        nameFi
        nameEn
        nameSv
        reservationUnitType {
          id: pk
          nameFi
          nameEn
          nameSv
        }
        unit {
          id: pk
          nameFi
          nameEn
          nameSv
        }
        maxPersons
        location {
          addressStreetFi
          addressStreetEn
          addressStreetSv
        }
        images {
          imageType
          mediumUrl
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;

/**
 * __useSearchReservationUnitsQuery__
 *
 * To run a query within a React component, call `useSearchReservationUnitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchReservationUnitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchReservationUnitsQuery({
 *   variables: {
 *      textSearch: // value for 'textSearch'
 *      minPersons: // value for 'minPersons'
 *      maxPersons: // value for 'maxPersons'
 *      unit: // value for 'unit'
 *      reservationUnitType: // value for 'reservationUnitType'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSearchReservationUnitsQuery(baseOptions?: Apollo.QueryHookOptions<SearchReservationUnitsQuery, SearchReservationUnitsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchReservationUnitsQuery, SearchReservationUnitsQueryVariables>(SearchReservationUnitsDocument, options);
      }
export function useSearchReservationUnitsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchReservationUnitsQuery, SearchReservationUnitsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchReservationUnitsQuery, SearchReservationUnitsQueryVariables>(SearchReservationUnitsDocument, options);
        }
export type SearchReservationUnitsQueryHookResult = ReturnType<typeof useSearchReservationUnitsQuery>;
export type SearchReservationUnitsLazyQueryHookResult = ReturnType<typeof useSearchReservationUnitsLazyQuery>;
export type SearchReservationUnitsQueryResult = Apollo.QueryResult<SearchReservationUnitsQuery, SearchReservationUnitsQueryVariables>;
export type SearchFormParamsQueryVariables = Exact<{ [key: string]: never; }>;


export type SearchFormParamsQuery = { __typename?: 'Query', units?: { __typename?: 'UnitTypeConnection', edges: Array<{ __typename?: 'UnitTypeEdge', node?: { __typename?: 'UnitType', pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined } | null | undefined> } | null | undefined };

export type ReservationUnitRecurringQueryVariables = Exact<{
  pk: Scalars['Int'];
}>;


export type ReservationUnitRecurringQuery = { __typename?: 'Query', reservationUnitByPk?: { __typename?: 'ReservationUnitByPkType', id: string, pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, descriptionFi?: string | null | undefined, descriptionEn?: string | null | undefined, descriptionSv?: string | null | undefined, termsOfUseFi?: string | null | undefined, termsOfUseEn?: string | null | undefined, termsOfUseSv?: string | null | undefined, maxPersons?: number | null | undefined, images?: Array<{ __typename?: 'ReservationUnitImageType', imageUrl?: string | null | undefined, mediumUrl?: string | null | undefined, smallUrl?: string | null | undefined, imageType: ReservationUnitImageImageType } | null | undefined> | null | undefined, reservationUnitType?: { __typename?: 'ReservationUnitTypeType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined, unit?: { __typename?: 'UnitType', id: string, pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined, location?: { __typename?: 'LocationType', latitude?: string | null | undefined, longitude?: string | null | undefined, addressStreetFi?: string | null | undefined, addressStreetEn?: string | null | undefined, addressStreetSv?: string | null | undefined, addressZip: string, addressCityFi?: string | null | undefined, addressCityEn?: string | null | undefined, addressCitySv?: string | null | undefined } | null | undefined, spaces?: Array<{ __typename?: 'SpaceType', pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, termsOfUseFi?: string | null | undefined, termsOfUseEn?: string | null | undefined, termsOfUseSv?: string | null | undefined } | null | undefined> | null | undefined, openingHours?: { __typename?: 'OpeningHoursType', openingTimePeriods?: Array<{ __typename?: 'PeriodType', periodId?: number | null | undefined, startDate?: any | null | undefined, endDate?: any | null | undefined, resourceState?: string | null | undefined, timeSpans?: Array<{ __typename?: 'TimeSpanType', startTime?: any | null | undefined, endTime?: any | null | undefined, resourceState?: string | null | undefined, weekdays?: Array<number | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined };

export type RelatedReservationUnitsQueryVariables = Exact<{
  unit?: Maybe<Scalars['ID']>;
}>;


export type RelatedReservationUnitsQuery = { __typename?: 'Query', reservationUnits?: { __typename?: 'ReservationUnitTypeConnection', edges: Array<{ __typename?: 'ReservationUnitTypeEdge', node?: { __typename?: 'ReservationUnitType', pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, maxPersons?: number | null | undefined, images?: Array<{ __typename?: 'ReservationUnitImageType', imageUrl?: string | null | undefined, smallUrl?: string | null | undefined, imageType: ReservationUnitImageImageType } | null | undefined> | null | undefined, unit?: { __typename?: 'UnitType', pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined, reservationUnitType?: { __typename?: 'ReservationUnitTypeType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined, location?: { __typename?: 'LocationType', addressStreetFi?: string | null | undefined, addressStreetEn?: string | null | undefined, addressStreetSv?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> } | null | undefined };

export type SelectedReservationUnitQueryVariables = Exact<{
  pk?: Maybe<Scalars['Int']>;
}>;


export type SelectedReservationUnitQuery = { __typename?: 'Query', reservationUnitByPk?: { __typename?: 'ReservationUnitByPkType', pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, unit?: { __typename?: 'UnitType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined } | null | undefined };

export type ReservationUnitSingleQueryVariables = Exact<{
  pk: Scalars['Int'];
}>;


export type ReservationUnitSingleQuery = { __typename?: 'Query', reservationUnitByPk?: { __typename?: 'ReservationUnitByPkType', id: string, pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, descriptionFi?: string | null | undefined, descriptionEn?: string | null | undefined, descriptionSv?: string | null | undefined, termsOfUseFi?: string | null | undefined, termsOfUseEn?: string | null | undefined, termsOfUseSv?: string | null | undefined, maxPersons?: number | null | undefined, minReservationDuration?: any | null | undefined, maxReservationDuration?: any | null | undefined, nextAvailableSlot?: any | null | undefined, images?: Array<{ __typename?: 'ReservationUnitImageType', imageUrl?: string | null | undefined, mediumUrl?: string | null | undefined, smallUrl?: string | null | undefined, imageType: ReservationUnitImageImageType } | null | undefined> | null | undefined, reservationUnitType?: { __typename?: 'ReservationUnitTypeType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined, unit?: { __typename?: 'UnitType', id: string, pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined } | null | undefined, location?: { __typename?: 'LocationType', latitude?: string | null | undefined, longitude?: string | null | undefined, addressStreetFi?: string | null | undefined, addressStreetEn?: string | null | undefined, addressStreetSv?: string | null | undefined, addressZip: string, addressCityFi?: string | null | undefined, addressCityEn?: string | null | undefined, addressCitySv?: string | null | undefined } | null | undefined, spaces?: Array<{ __typename?: 'SpaceType', pk?: number | null | undefined, nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, termsOfUseFi?: string | null | undefined, termsOfUseEn?: string | null | undefined, termsOfUseSv?: string | null | undefined } | null | undefined> | null | undefined, openingHours?: { __typename?: 'OpeningHoursType', openingTimePeriods?: Array<{ __typename?: 'PeriodType', periodId?: number | null | undefined, startDate?: any | null | undefined, endDate?: any | null | undefined, resourceState?: string | null | undefined, timeSpans?: Array<{ __typename?: 'TimeSpanType', startTime?: any | null | undefined, endTime?: any | null | undefined, resourceState?: string | null | undefined, weekdays?: Array<number | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined };

export type ReservationUnitOpeningHoursQueryVariables = Exact<{
  pk?: Maybe<Scalars['Int']>;
  startDate?: Maybe<Scalars['Date']>;
  endDate?: Maybe<Scalars['Date']>;
  from?: Maybe<Scalars['Date']>;
  to?: Maybe<Scalars['Date']>;
  state?: Maybe<Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>>;
}>;


export type ReservationUnitOpeningHoursQuery = { __typename?: 'Query', reservationUnitByPk?: { __typename?: 'ReservationUnitByPkType', openingHours?: { __typename?: 'OpeningHoursType', openingTimes?: Array<{ __typename?: 'OpeningTimesType', date?: any | null | undefined, startTime?: any | null | undefined, endTime?: any | null | undefined, state?: string | null | undefined, periods?: Array<number | null | undefined> | null | undefined } | null | undefined> | null | undefined } | null | undefined, reservations?: Array<{ __typename?: 'ReservationType', pk?: number | null | undefined, state: ReservationState, priority: ReservationPriority, begin: any, end: any, numPersons?: number | null | undefined, calendarUrl?: string | null | undefined } | null | undefined> | null | undefined } | null | undefined };

export type SearchReservationUnitsQueryVariables = Exact<{
  textSearch?: Maybe<Scalars['String']>;
  minPersons?: Maybe<Scalars['Float']>;
  maxPersons?: Maybe<Scalars['Float']>;
  unit?: Maybe<Scalars['ID']>;
  reservationUnitType?: Maybe<Scalars['ID']>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
}>;


export type SearchReservationUnitsQuery = { __typename?: 'Query', reservationUnits?: { __typename?: 'ReservationUnitTypeConnection', edges: Array<{ __typename?: 'ReservationUnitTypeEdge', node?: { __typename?: 'ReservationUnitType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, maxPersons?: number | null | undefined, id?: number | null | undefined, reservationUnitType?: { __typename?: 'ReservationUnitTypeType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, id?: number | null | undefined } | null | undefined, unit?: { __typename?: 'UnitType', nameFi?: string | null | undefined, nameEn?: string | null | undefined, nameSv?: string | null | undefined, id?: number | null | undefined } | null | undefined, location?: { __typename?: 'LocationType', addressStreetFi?: string | null | undefined, addressStreetEn?: string | null | undefined, addressStreetSv?: string | null | undefined } | null | undefined, images?: Array<{ __typename?: 'ReservationUnitImageType', imageType: ReservationUnitImageImageType, mediumUrl?: string | null | undefined } | null | undefined> | null | undefined } | null | undefined } | null | undefined>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null | undefined, hasNextPage: boolean } } | null | undefined };
