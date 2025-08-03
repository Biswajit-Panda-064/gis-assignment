import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const MapTooltip = forwardRef(({ map }, ref) => {
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (!map) return;
        const tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.padding = "4px 8px";
        tooltip.style.background = "white";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.borderRadius = "4px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.fontSize = "12px";
        tooltip.style.zIndex = 100;
        tooltip.style.display = "none";

        document.body.appendChild(tooltip);
        tooltipRef.current = tooltip;

        const handlePointerMove = (evt) => {
            const pixel = map.getEventPixel(evt.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel, (f) => f);
            const name = feature?.get("name") || null;
            const type = feature?.get("type") || null;
            if (feature && name && type) {
                tooltip.innerHTML = `<strong>name:${name}</strong><br/><small>type:${type}</small>`;
                tooltip.style.left = evt.originalEvent.pageX + 10 + "px";
                tooltip.style.top = evt.originalEvent.pageY + 10 + "px";
                tooltip.style.display = "block";
            } else {
                tooltip.style.display = "none";
            }
        };

        map.on("pointermove", handlePointerMove);
        return () => {
            map.un("pointermove", handlePointerMove);
            tooltip.remove();
        };
    }, [map]);

    
    useImperativeHandle(ref, () => ({
        hideTooltip: () => {
            if (tooltipRef.current) {
                tooltipRef.current.style.display = "none";
            }
        },
    }));

    return null;
});

export default MapTooltip;
