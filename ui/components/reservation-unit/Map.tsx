import React, { useState } from "react";
import ReactMapGL, { Marker, NavigationControl } from "react-map-gl";
import { mapboxToken, mapStyle } from "../../modules/const";

type State = Record<string, number>;
type Props = { title: string; latitude?: number; longitude?: number };
const ZOOM = 14;

const navControlStyle = {
  right: 10,
  bottom: 10,
};

const Map = ({ title, latitude, longitude }: Props): JSX.Element | null => {
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom: ZOOM,
  } as State);

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <ReactMapGL
      {...viewport}
      mapStyle={mapStyle}
      width="100%"
      height="600px"
      onViewportChange={(
        newViewPort: React.SetStateAction<Record<string, number>>
      ) => setViewport(newViewPort)}
      mapboxApiAccessToken={mapboxToken}
    >
      <NavigationControl style={navControlStyle} />
      <Marker key={title} longitude={longitude} latitude={latitude}>
        <img src="/mapMarkerIcon.svg" height="42" width="32" alt="" />
      </Marker>
    </ReactMapGL>
  );
};

export default Map;
