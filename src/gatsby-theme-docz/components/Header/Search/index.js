import React, { useState, useEffect, createRef } from "react";
import {
  InstantSearch,
  Index,
  Hits,
  connectStateResults,
} from "react-instantsearch-dom";
import { useColorMode } from "theme-ui";
import algoliasearch from "algoliasearch/lite";
import * as styles from "gatsby-theme-docz/src/components/NavSearch/styles";
import { Root, HitsWrapper, PoweredBy } from "./primitives";
import Input from "./Input";
import * as hitComps from "./hitComps";

const Results = connectStateResults(
  ({ searchState: state, searchResults: res, children }) =>
    res && res.nbHits > 0
      ? children
      : `No results for '${state.query || "N/A"}'`
);

const Stats = connectStateResults(
  ({ searchResults: res }) =>
    res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`
);

const useClickOutside = (ref, handler, events) => {
  if (!events) events = [`mousedown`, `touchstart`];
  const detectClickOutside = (event) =>
    !ref.current.contains(event.target) && handler();
  useEffect(() => {
    for (const event of events)
      document.addEventListener(event, detectClickOutside);
    return () => {
      for (const event of events)
        document.removeEventListener(event, detectClickOutside);
    };
  });
};
const indices = [
  {
    name: process.env.GATSBY_ALGOLIA_INDEX_NAME,
    title: `Search Results`,
    hitComp: `PageHit`,
  },
];
export const NavSearch = ({ collapse, hitsAsGrid }) => {
  const [colorMode] = useColorMode();
  const ref = createRef();
  const [query, setQuery] = useState(``);
  const [focus, setFocus] = useState(false);
  const [Mounted, setMounted] = useState(false);
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  );
  useClickOutside(ref, () => setFocus(false));
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indices[0].name}
      onSearchStateChange={({ query }) => setQuery(query)}
    >
      <div
        style={{
          ...styles.wrapper,
          padding: "5px 10px 5px 10px",
          borderRadius: "5px",
          margin: "0px 10px",
          background: "white",
        }}
        ref={ref}
      >
        <Input
          onFocus={() => setFocus(true)}
          {...{ collapse, focus }}
          colorMode={colorMode}
        />
        <HitsWrapper
          show={query.length > 0 && focus}
          asGrid={hitsAsGrid}
          colorMode={colorMode}
        >
          {indices.map(({ name, title, hitComp }) => (
            <Index key={name} indexName={name}>
              <header>
                <h3>{title}</h3>
                <Stats />
              </header>
              <Results>
                <Hits hitComponent={hitComps[hitComp](() => setFocus(false))} />
              </Results>
            </Index>
          ))}
          {/* <PoweredBy /> */}
        </HitsWrapper>
      </div>
    </InstantSearch>
  );
};
export default NavSearch;
