import React from "react";
import sanitizeHtml from "sanitize-html";
import styled from "styled-components";

type Props = {
  html: string;
  style?: React.CSSProperties;
};

const StyledContent = styled.div`
  p {
    margin-block: 0;
  }
  a {
    text-decoration: underline;
    color: var(--tilavaraus-link-color);
    :visited {
      color: var(--tilavaraus-link-visited-color);
    }
  }
`;

const config = {
  allowedTags: ["p", "strong", "a", "br"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
};

function Sanitize({ html, style }: Props): JSX.Element | null {
  if (!html) {
    return null;
  }

  return (
    <StyledContent
      style={style}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(html, config),
      }}
    />
  );
}

export default Sanitize;
