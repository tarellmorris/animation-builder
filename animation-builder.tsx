import type { FunctionComponent } from 'react';
import React, { useState } from 'react';
import PlusSmallFilled from '@uber/icons/plus-small-filled.js';
import { styled, useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { Button, SIZE } from 'baseui/button';
import { Tab, Tabs } from 'baseui/tabs-motion';
import { useField } from 'formik';

import { PlainTextLine } from './plain-text-line';
import { Selector } from './selector';

type AnimationBuilderT = FunctionComponent<{
  path: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}>;

type fieldsT = Array<{
  field: string;
  label: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}>;

export const tabSchema = [
  {
    field: 'mobile',
    label: 'Mobile',
    required: false,
  },
  {
    field: 'tablet',
    label: 'Tablet',
    required: false,
  },
  {
    field: 'desktop',
    label: 'Desktop',
    required: false,
  },
];
export const animationTypes = [
  { value: 'fadeIn', label: 'Fade in' },
  { value: 'fadeFromTop', label: 'Fade from top' },
  { value: 'fadeFromBottom', label: 'Fade from bottom' },
  { value: 'fadeFromLeft', label: 'Fade from left' },
  { value: 'fadeFromRight', label: 'Fade from right' },
];

export const AnimationBuilder: AnimationBuilderT = (props) => {
  const { options: targetElements, path } = props;
  const [field, , helpers] = useField(path);
  const [activeKey, setActiveKey] = useState('mobile');
  const [, theme] = useStyletron();

  const tabOverrides = {
    Tab: {
      style: {
        background: theme.colors.backgroundTertiary,
        ':hover': {
          background: theme.colors.backgroundTertiary,
        },
      },
    },
  };
  const tabsOverrides = {
    Root: {
      style: {
        outline: `${theme.colors.backgroundTertiary} solid 2px`,
      },
    },
    TabList: {
      style: {
        backgroundColor: theme.colors.backgroundTertiary,
      },
    },
  };

  const fields: fieldsT = [
    { field: 'targetElement', label: 'Target element', options: targetElements },
    { field: 'animationType', label: 'Animation type', options: animationTypes },
  ];

  const handleAdd = (tabKey: string) => {
    if (Array.isArray(field?.value?.[tabKey])) {
      helpers.setValue({
        ...field.value,
        [tabKey]: [...field?.value?.[tabKey], []],
      });
    } else {
      helpers.setValue({
        ...field?.value,
        [tabKey]: [[]],
      });
    }
  };
  const handleRemove = (tabKey: string, schemaIndex) => {
    helpers.setValue({
      ...field?.value,
      [tabKey]: field?.value?.[tabKey]?.filter(
        (animation) => animation !== field?.value?.[tabKey]?.[schemaIndex]
      ),
    });
  };

  return (
    <Block marginTop={theme.sizing.scale300}>
      <Tabs
        activeKey={activeKey}
        onChange={({ activeKey }) => {
          setActiveKey(activeKey);
        }}
        activateOnFocus
        overrides={tabsOverrides}
      >
        {tabSchema?.map((tab, tabIndex) => {
          const { field: tabKey, label } = tab;
          return (
            <Tab title={label} key={tabKey} overrides={tabOverrides}>
              {field?.value?.[tabKey]?.map((schema, schemaIndex) => {
                return (
                  <div key={schemaIndex}>
                    {fields.map((selectorField, fieldIndex) => {
                      const { field: nestedField, label, options, ...rest } = selectorField;
                      const nestedPath = `${path}.${tabKey}[${schemaIndex}][${fieldIndex}]`;
                      return (
                        <Selector
                          {...rest}
                          key={fieldIndex}
                          field={nestedField}
                          label={label}
                          path={nestedPath}
                          options={options}
                          required={false}
                        />
                      );
                    })}
                    <PlainTextLine
                      hidden
                      label="Schema index passthrough"
                      setValueOnMount={schemaIndex}
                      path={`${path}.${tabKey}[${schemaIndex}][2]`}
                    />
                    <LinkButton
                      onKeyDown={() => handleRemove(tabKey, schemaIndex)}
                      onClick={() => handleRemove(tabKey, schemaIndex)}
                      role="button"
                      tabIndex={0}
                    >
                      Remove element
                    </LinkButton>
                    <Separator />
                  </div>
                );
              })}
              <Button
                onClick={() => handleAdd(tabKey)}
                size={SIZE.compact}
                startEnhancer={() => <PlusSmallFilled size={16} />}
                overrides={{
                  BaseButton: {
                    style: {
                      width: '100%',
                    },
                  },
                }}
              >
                Add element
              </Button>
            </Tab>
          );
        })}
      </Tabs>
    </Block>
  );
};

const LinkButton = styled('a', ({ $theme }) => ({
  color: $theme.colors.contentSecondary,
  cursor: 'pointer',
  textDecoration: 'underline',
}));
const Separator = styled('hr', ({ $theme }) => ({
  marginTop: $theme.sizing.scale500,
  marginBottom: $theme.sizing.scale600,
  border: `1px solid ${$theme.colors.backgroundSecondary}`,
}));
