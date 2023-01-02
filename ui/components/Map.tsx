import React, { useState } from "react";
import Image from "next/image";
import ReactMapGL, { Marker, NavigationControl, ViewState } from "react-map-gl";
import { mapboxToken, mapStyle } from "../modules/const";

type Props = {
  title: string;
  latitude?: number;
  longitude?: number;
  height?: string;
};
const ZOOM = 14;

const navControlStyle = {
  right: 10,
  bottom: 10,
};

const Map = ({
  title,
  latitude,
  longitude,
  height = "480px",
}: Props): JSX.Element | null => {
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom: ZOOM,
  } as ViewState);

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <ReactMapGL
      {...viewport}
      id="hel-osm-light"
      mapStyle={mapStyle}
      style={{ width: "100%", height }}
      onMove={(event) => {
        setViewport(event.viewState);
      }}
      mapboxAccessToken={mapboxToken}
    >
      <NavigationControl style={navControlStyle} showCompass={false} />
      <Marker key={title} longitude={longitude} latitude={latitude}>
        <Image src="/icons/map_marker_icon.svg" height="42" width="32" alt="" />
      </Marker>
    </ReactMapGL>
  );
};

export default Map;
