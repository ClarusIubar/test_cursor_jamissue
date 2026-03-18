from __future__ import annotations

import math


def haversine_meters(*, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def is_within_radius_meters(*, radius_m: float, lat: float, lng: float, target_lat: float, target_lng: float) -> bool:
    return haversine_meters(lat1=lat, lng1=lng, lat2=target_lat, lng2=target_lng) <= radius_m

