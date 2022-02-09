import React, { useReducer, useState } from "react";
import {
  Notification,
  NumberInput,
  TextInput,
  Select,
  Button,
  ErrorSummary,
} from "hds-react";
import { get, omitBy, pick, upperFirst } from "lodash";

import { FetchResult, useMutation, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useParams, useHistory, Link } from "react-router-dom";
import styled from "styled-components";
import Joi from "joi";
import { ContentContainer, IngressContainer } from "../../styles/layout";
import { breakpoints } from "../../styles/util";
import Loader from "../Loader";
import withMainMenu from "../withMainMenu";
import {
  SPACE_HIERARCHY_QUERY,
  SPACE_QUERY,
  UPDATE_SPACE,
} from "../../common/queries";
import SpaceHead from "./SpaceHead";
import { H1 } from "../../styles/typography";
import SpaceHierarchy from "./SpaceHierarchy";
import {
  Maybe,
  Query,
  QuerySpaceByPkArgs,
  SpaceType,
  SpaceUpdateMutationInput,
  SpaceUpdateMutationPayload,
  UnitType,
} from "../../common/gql-types";
import { languages } from "../../common/const";
import { spacesAsHierarchy } from "./util";
import { useNotification } from "../../context/NotificationContext";

interface IProps {
  unitPk: string;
  spacePk: string;
}

type NotificationType = {
  title: string;
  text: string;
  type: "success" | "error";
};

type ParentType = { label: string; value: number | null };

const independentSpaceOption = {
  label: i18next.t("SpaceEditor.noParent"),
  value: null,
};

type Action =
  | {
      type: "setNotification";
      notification: NotificationType;
    }
  | { type: "clearNotification" }
  | {
      type: "setValidatioErrors";
      validationErrors: Joi.ValidationResult | null;
    }
  | { type: "clearError" }
  | { type: "dataLoaded"; space: SpaceType }
  | { type: "hierarchyLoaded"; spaces: SpaceType[] }
  | { type: "dataLoadError"; message: string }
  // eslint-disable-next-line
  | { type: "set"; value: any };

type State = {
  spacePk?: number;
  unitPk?: number;
  notification: null | NotificationType;
  loading: boolean;
  space: SpaceType | null;
  spaceEdit: SpaceUpdateMutationInput | null;
  parent?: SpaceType;
  unitSpaces?: SpaceType[];
  hasChanges: boolean;
  error: null | {
    message: string;
  };
  parentOptions: ParentType[];
  validationErrors: Joi.ValidationResult | null;
};

const getInitialState = (spacePk: number, unitPk: number): State => ({
  spacePk,
  unitPk,
  loading: true,
  notification: null,
  space: null,
  spaceEdit: null,
  error: null,
  hasChanges: false,
  parentOptions: [independentSpaceOption],
  validationErrors: null,
});

const schema = Joi.object({
  nameFi: Joi.string().min(3).max(80),
  nameSv: Joi.string().min(3).max(80),
  nameEn: Joi.string().min(3).max(80),
  surfaceArea: Joi.number().min(1),
  maxPersons: Joi.number().min(1),
  unitPk: Joi.number(),
  pk: Joi.number(),
  parentPk: Joi.number().allow(null),
  code: Joi.string().allow("").optional(),
}).options({
  abortEarly: false,
  messages: {
    "*": "Virhe",
  },
});

const modified = (d: State) => ({ ...d, hasChanges: true });

const getChildrenFor = (space: SpaceType, hierarchy: SpaceType[]) => {
  return hierarchy.filter((s) => s.parent?.pk === space.pk);
};

const getChildrenRecursive = (space: SpaceType, hierarchy: SpaceType[]) => {
  const newChildren = getChildrenFor(space, hierarchy);
  return newChildren.concat(
    newChildren.flatMap((s) => getChildrenFor(s, hierarchy))
  );
};

const withLoadingState = (state: State): State => {
  let additionalOptions: ParentType[] = [];
  if (state.unitSpaces && state.space) {
    const children = getChildrenRecursive(state.space, state.unitSpaces).map(
      (s) => s.pk
    );

    additionalOptions = state.unitSpaces
      .filter((space) => space.pk !== state.spacePk)
      .filter((space) => children.indexOf(space.pk) === -1)
      .map((space) => ({
        label: space.nameFi as string,
        value: space.pk as number,
      }));
  }
  return {
    ...state,
    parentOptions: [independentSpaceOption, ...additionalOptions],
    loading: state.space === null || state.unitSpaces === undefined,
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "clearNotification": {
      return { ...state, notification: null };
    }
    case "setNotification": {
      return { ...state, notification: { ...action.notification } };
    }
    case "dataLoaded": {
      const { space } = action;
      return withLoadingState({
        ...state,
        space: {
          ...space,
        },
        spaceEdit: {
          ...pick(
            {
              ...space,
              pk: space.pk,
              maxPersons: space.maxPersons || 1,
              surfaceArea: space.surfaceArea || 1,
            },
            [
              "pk",
              "nameFi",
              "nameSv",
              "nameEn",
              "surfaceArea",
              "maxPersons",
              "code",
            ]
          ),
          parentPk: space.parent ? space.parent?.pk : null,
          unitPk: space.unit ? space.unit.pk : undefined,
        } as SpaceUpdateMutationInput,
        hasChanges: false,
        validationErrors: null,
      });
    }
    case "hierarchyLoaded": {
      const unitSpaces = spacesAsHierarchy(
        action.spaces.filter((space) => {
          return space.unit?.pk === state.unitPk;
        }),
        "\u2007"
      );

      return withLoadingState({
        ...state,
        unitSpaces,
      });
    }
    case "dataLoadError": {
      return {
        ...state,
        loading: false,
        hasChanges: false,
        error: { message: action.message },
      };
    }
    case "clearError": {
      return {
        ...state,
        error: null,
      };
    }

    case "set": {
      return modified({
        ...state,
        spaceEdit: { ...state.spaceEdit, ...action.value },
      });
    }

    case "setValidatioErrors": {
      return {
        ...state,
        validationErrors: action.validationErrors,
      };
    }

    default:
      return state;
  }
};

const Wrapper = styled.div``;

const StyledNotification = styled(Notification)`
  margin: var(--spacing-xs) var(--spacing-layout-2-xs);
  width: auto;
  @media (min-width: ${breakpoints.xl}) {
    margin: var(--spacing-s) var(--spacing-layout-xl);
  }
`;

const EditorContainer = styled.div`
  margin: 0 var(--spacing-layout-m);
`;

const EditorRows = styled.div`
  display: grid;
  gap: var(--spacing-s);
  grid-template-columns: 1fr;
`;

const EditorColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: baseline;
  gap: var(--spacing-s);
  margin-top: var(--spacing-s);
  padding-bottom: var(--spacing-m);
`;

const Editor = styled.div`
  margin: 0 var(--spacing-layout-m);
  max-width: 52rem;
`;

const Section = styled.div`
  margin: var(--spacing-layout-l) 0;
`;

const SubHeading = styled.div`
  font-family: var(--tilavaraus-admin-font-bold);
  font-size: var(--fontsize-heading-xs);
  margin-bottom: var(--spacing-m);
`;

const Buttons = styled.div`
  display: flex;
  margin: var(--spacing-layout-m) 0;
`;

const SaveButton = styled(Button)`
  margin-left: auto;
`;

const MyErrorSummary = ({
  validationErrors,
}: {
  validationErrors: Joi.ValidationResult | null;
}) =>
  !validationErrors ? null : (
    <ErrorSummary label={i18next.t("SpaceEditor.errorSummary")} autofocus>
      <ul>
        {validationErrors.error?.details.map((error) => (
          <li key={String(error.path)}>
            <Link to={{ hash: `${error.path}` }}>
              {i18next.t(`SpaceEditor.label.${error.path}`)}
            </Link>
            {": "}
            {i18next.t(`validation.${error.type}`, { ...error.context })}
          </li>
        ))}
      </ul>
    </ErrorSummary>
  );

const getParent = (v: Maybe<number> | undefined, options: ParentType[]) =>
  options.find((po) => po.value === v) || options[0];

const SpaceEditor = (): JSX.Element | null => {
  const { spacePk, unitPk } = useParams<IProps>();
  const [saving, setSaving] = useState(false);
  const history = useHistory();

  const { notifyError, notifySuccess } = useNotification();

  const [state, dispatch] = useReducer(
    reducer,
    getInitialState(Number(spacePk), Number(unitPk))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setValue = (value: any) => {
    dispatch({ type: "set", value });
  };

  const onDataError = (text: string) => {
    dispatch({ type: "dataLoadError", message: text });
  };

  const [updateSpaceMutation] = useMutation<
    { updateSpace: SpaceUpdateMutationPayload },
    { input: SpaceUpdateMutationInput }
  >(UPDATE_SPACE);

  const updateSpace = (
    input: SpaceUpdateMutationInput
  ): Promise<FetchResult<{ updateSpace: SpaceUpdateMutationPayload }>> =>
    updateSpaceMutation({ variables: { input } });

  const { t } = useTranslation();

  const { refetch } = useQuery<Query, QuerySpaceByPkArgs>(SPACE_QUERY, {
    variables: { pk: Number(spacePk) },
    onCompleted: ({ spaceByPk }) => {
      if (spaceByPk) {
        dispatch({ type: "dataLoaded", space: spaceByPk });
      }
    },
    onError: (e) => {
      onDataError(t("errors.errorFetchingData", { error: e }));
    },
  });

  useQuery<Query>(SPACE_HIERARCHY_QUERY, {
    onCompleted: ({ spaces }) => {
      const result = spaces?.edges.map((s) => s?.node as SpaceType);
      if (result) {
        dispatch({
          type: "hierarchyLoaded",
          spaces: result,
        });
      }
    },
    onError: (e) => {
      onDataError(t("errors.errorFetchingData", { error: e }));
    },
  });

  const onSave = async () => {
    setSaving(true);
    try {
      const data = await updateSpace({
        ...(omitBy(
          state.spaceEdit,
          (v) => v === ""
        ) as SpaceUpdateMutationInput),
        surfaceArea: Number(state.spaceEdit?.surfaceArea),
      });
      if (data?.data?.updateSpace.errors === null) {
        notifySuccess(
          t("SpaceEditor.spaceUpdated"),
          t("SpaceEditor.spaceUpdatedNotification")
        );
        refetch();
      } else {
        notifyError(t("SpaceEditor.saveFailed"));
      }
    } catch {
      notifyError(t("SpaceEditor.saveFailed"));
    }
    setSaving(false);
  };

  if (state.loading) {
    return <Loader />;
  }

  if (state.error && !state.space) {
    return (
      <Wrapper>
        <Notification
          type="error"
          label={t("errors.functionFailed")}
          position="top-center"
          autoClose={false}
          dismissible
          onClose={() => dispatch({ type: "clearError" })}
          closeButtonLabelText={t("common.close")}
          displayAutoCloseProgress={false}
        >
          {t(state.error.message)}
        </Notification>
      </Wrapper>
    );
  }

  if (state.space === null) {
    return null;
  }

  const getValidationError = (name: string): string | undefined => {
    const error = state.validationErrors?.error?.details.find((errorDetail) =>
      errorDetail.path.find((path) => path === name)
    );

    if (!error) {
      return undefined;
    }

    return t(`validation.${error.type}`, { ...error.context });
  };

  console.log("rendering with ", state);

  return (
    <Wrapper>
      <SpaceHead
        title={state.space.parent?.nameFi || t("SpaceEditor.noParent")}
        unit={state.space.unit as UnitType}
        maxPersons={state.spaceEdit?.maxPersons || undefined}
        surfaceArea={state.spaceEdit?.surfaceArea || undefined}
      />
      <IngressContainer>
        {state.notification ? (
          <StyledNotification
            type={state.notification.type}
            label={t(state.notification.title)}
            dismissible
            closeButtonLabelText={`${t("common.close")}`}
            onClose={() => dispatch({ type: "clearNotification" })}
          >
            {t(state.notification.text)}
          </StyledNotification>
        ) : null}
      </IngressContainer>
      <ContentContainer>
        <EditorContainer>
          <H1>{t("SpaceEditor.details")}</H1>
          <Editor>
            <MyErrorSummary validationErrors={state.validationErrors} />

            <Section>
              <SubHeading>{t("SpaceEditor.hierarchy")}</SubHeading>
              <SpaceHierarchy
                space={state.space}
                unitSpaces={state.unitSpaces}
              />
              <Select
                id="parent"
                label={t("SpaceModal.page1.parentLabel")}
                placeholder={t("SpaceModal.page1.parentPlaceholder")}
                required
                helper={t("SpaceModal.page1.parentHelperText")}
                options={state.parentOptions}
                value={getParent(
                  state.spaceEdit?.parentPk,
                  state.parentOptions
                )}
                onChange={(selected: ParentType) =>
                  setValue({ parentPk: selected.value })
                }
              />
            </Section>
            <Section>
              <SubHeading>{t("SpaceEditor.other")}</SubHeading>
              <EditorRows>
                {languages.map((lang) => {
                  const fieldName = `name${upperFirst(lang)}`;
                  return (
                    <TextInput
                      key={lang}
                      required
                      id={fieldName}
                      label={t(`SpaceEditor.label.${fieldName}`)}
                      value={get(state, `spaceEdit.${fieldName}`, "")}
                      placeholder={t("SpaceEditor.namePlaceholder", {
                        language: t(`language.${lang}`),
                      })}
                      onChange={(e) =>
                        setValue({
                          [fieldName]: e.target.value,
                        })
                      }
                      errorText={getValidationError(fieldName)}
                      invalid={!!getValidationError(fieldName)}
                    />
                  );
                })}
              </EditorRows>

              <EditorColumns>
                <NumberInput
                  value={state.spaceEdit?.surfaceArea || 0}
                  id="surfaceArea"
                  label={t("SpaceEditor.label.maxPersons")}
                  helperText={t("SpaceModal.page2.surfaceAreaHelperText")}
                  minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
                  plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
                  onChange={(e) =>
                    setValue({ surfaceArea: Number(e.target.value) })
                  }
                  step={1}
                  type="number"
                  min={1}
                  required
                  errorText={getValidationError("surfaceArea")}
                />
                <NumberInput
                  value={state.spaceEdit?.maxPersons || 0}
                  id="maxPersons"
                  label={t("SpaceEditor.label.maxPersons")}
                  minusStepButtonAriaLabel={t("common.decreaseByOneAriaLabel")}
                  plusStepButtonAriaLabel={t("common.increaseByOneAriaLabel")}
                  onChange={(e) =>
                    setValue({ maxPersons: Number(e.target.value) })
                  }
                  step={1}
                  type="number"
                  min={1}
                  helperText={t("SpaceModal.page2.maxPersonsHelperText")}
                  required
                  errorText={getValidationError("maxPersons")}
                />
                <TextInput
                  id="code"
                  label={t("SpaceModal.page2.codeLabel")}
                  placeholder={t("SpaceModal.page2.codePlaceholder")}
                  value={state.spaceEdit?.code || ""}
                  onChange={(e) => setValue({ code: e.target.value })}
                />
              </EditorColumns>
            </Section>
            <Buttons>
              <Button
                disabled={!state.hasChanges}
                variant="secondary"
                onClick={() => history.go(-1)}
              >
                {t("SpaceEditor.cancel")}
              </Button>
              <SaveButton
                disabled={!state.hasChanges}
                onClick={(e) => {
                  e.preventDefault();
                  const validationErrors = schema.validate(state.spaceEdit);
                  if (validationErrors.error) {
                    dispatch({ type: "setValidatioErrors", validationErrors });
                  } else {
                    onSave();
                  }
                }}
                isLoading={saving}
                loadingText={t("saving")}
              >
                {t("SpaceEditor.save")}
              </SaveButton>
            </Buttons>
          </Editor>
        </EditorContainer>
      </ContentContainer>
      {state.error ? (
        <Wrapper>
          <Notification
            type="error"
            label={t("errors.functionFailed")}
            position="top-center"
            autoClose={false}
            dismissible
            onClose={() => dispatch({ type: "clearError" })}
            closeButtonLabelText={t("common.close")}
            displayAutoCloseProgress={false}
          >
            {t(state.error?.message)}
          </Notification>
        </Wrapper>
      ) : null}
    </Wrapper>
  );
};

export default withMainMenu(SpaceEditor);
