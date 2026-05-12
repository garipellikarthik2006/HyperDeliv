import { Location, OrderTracking } from './realTimeTracking';
import { TRACKING_ALGORITHMS, GOOGLE_MAPS_URLS } from '@/config/googleMaps';

// Node interface for graph algorithms
export interface GraphNode {
  id: string;
  location: Location;
  edges: GraphEdge[];
}

// Edge interface for graph algorithms
export interface GraphEdge {
  target: string;
  distance: number; // in meters
  time: number; // in minutes
  weight: number; // combined weight for optimization
}

// Route optimization result
export interface RouteOptimization {
  route: Location[];
  estimatedTime: number;
  distance: number;
  algorithm: string;
  confidence: number; // 0-1 score
}

// Fast tracking algorithms service
class FastTrackingAlgorithms {
  private graph: Map<string, GraphNode> = new Map();
  private trafficData: Map<string, number> = new Map(); // traffic factor by road segment

  constructor() {
    this.initializeGraph();
  }

  // Initialize graph with Hyderabad road network (simplified)
  private initializeGraph() {
    // This would typically load from a real road network database
    // For now, we'll create a simplified version
    const keyLocations = [
      { id: 'hyderabad_center', lat: 17.3850, lng: 78.4867 },
      { id: 'banjara_hills', lat: 17.4173, lng: 78.4351 },
      { id: 'jubilee_hills', lat: 17.4257, lng: 78.4240 },
      { id: 'gachibowli', lat: 17.4498, lng: 78.3763 },
      { id: 'hitec_city', lat: 17.4458, lng: 78.3783 },
      { id: 'madhapur', lat: 17.4489, lng: 78.3930 },
      { id: 'kondapur', lat: 17.4625, lng: 78.3733 },
      { id: 'panjagutta', lat: 17.4189, lng: 78.4476 },
      { id: 'ameerpet', lat: 17.4369, lng: 78.4476 },
      { id: 'sr_nagar', lat: 17.4477, lng: 78.4476 },
      { id: 'kukatpally', lat: 17.4915, lng: 78.3930 },
      { id: 'miyapur', lat: 17.5055, lng: 78.3673 },
      { id: 'lingampally', lat: 17.5111, lng: 78.3323 },
      { id: 'secunderabad', lat: 17.4399, lng: 78.4982 },
      { id: 'tarnaka', lat: 17.4169, lng: 78.5488 },
      { id: 'uppal', lat: 17.4169, lng: 78.5988 },
      { id: 'nagole', lat: 17.3169, lng: 78.5988 },
      { id: 'lb_nagar', lat: 17.3169, lng: 78.5488 },
      { id: 'dilsukhnagar', lat: 17.3669, lng: 78.5238 },
      { id: 'malakpet', lat: 17.3669, lng: 78.4988 }
    ];

    // Create nodes
    keyLocations.forEach(loc => {
      this.graph.set(loc.id, {
        id: loc.id,
        location: { lat: loc.lat, lng: loc.lng, timestamp: Date.now() },
        edges: []
      });
    });

    // Create edges (simplified connections)
    this.createEdges();
  }

  // Create edges between nearby locations
  private createEdges() {
    const nodes = Array.from(this.graph.values());
    
    nodes.forEach(node1 => {
      nodes.forEach(node2 => {
        if (node1.id !== node2.id) {
          const distance = this.calculateDistance(node1.location, node2.location);
          
          // Only connect nearby locations (within 10km)
          if (distance < 10000) {
            const time = this.calculateTime(distance);
            const weight = this.calculateWeight(distance, time);
            
            node1.edges.push({
              target: node2.id,
              distance,
              time,
              weight
            });
          }
        }
      });
    });
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Calculate travel time based on distance and traffic
  private calculateTime(distance: number): number {
    const baseSpeed = 40; // km/h
    const trafficFactor = this.getTrafficFactor(distance);
    const adjustedSpeed = baseSpeed * trafficFactor;
    return (distance / 1000) / adjustedSpeed * 60; // convert to minutes
  }

  // Calculate weight for optimization
  private calculateWeight(distance: number, time: number): number {
    // Weight can be customized based on business requirements
    // For now, we'll use a combination of distance and time
    return distance * 0.3 + time * 0.7;
  }

  // Get traffic factor for a road segment
  private getTrafficFactor(distance: number): number {
    // Simplified traffic simulation
    // In real implementation, this would fetch from traffic API
    const hour = new Date().getHours();
    
    // Rush hour traffic
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      return 0.6; // 40% slower
    }
    
    // Normal traffic
    return 0.8;
  }

  // Dijkstra's algorithm for shortest path
  public dijkstra(startId: string, endId: string): RouteOptimization | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>();

    // Initialize distances
    this.graph.forEach((node, id) => {
      distances.set(id, id === startId ? 0 : Infinity);
      unvisited.add(id);
    });

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach(id => {
        const distance = distances.get(id) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          current = id;
        }
      });

      if (!current || current === endId) break;

      unvisited.delete(current);

      // Update distances to neighbors
      const currentNode = this.graph.get(current);
      if (currentNode) {
        currentNode.edges.forEach(edge => {
          const alt = (distances.get(current) || Infinity) + edge.weight;
          if (alt < (distances.get(edge.target) || Infinity)) {
            distances.set(edge.target, alt);
            previous.set(edge.target, current);
          }
        });
      }
    }

    // Reconstruct path
    const path = this.reconstructPath(previous, startId, endId);
    if (path.length === 0) return null;

    const route = path.map(id => this.graph.get(id)?.location).filter(Boolean) as Location[];
    const totalDistance = this.calculateRouteDistance(route);
    const totalTime = this.calculateRouteTime(route);

    return {
      route,
      estimatedTime: totalTime,
      distance: totalDistance,
      algorithm: TRACKING_ALGORITHMS.SHORTEST_PATH,
      confidence: 0.85
    };
  }

  // A* algorithm for fastest route
  public aStar(startId: string, endId: string): RouteOptimization | null {
    const openSet = new Set<string>([startId]);
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const previous = new Map<string, string>();

    // Initialize scores
    this.graph.forEach((node, id) => {
      gScore.set(id, id === startId ? 0 : Infinity);
      fScore.set(id, Infinity);
    });

    const endNode = this.graph.get(endId);
    if (!endNode) return null;

    fScore.set(startId, this.heuristic(startId, endId));

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current: string | null = null;
      let minFScore = Infinity;

      openSet.forEach(id => {
        const score = fScore.get(id) || Infinity;
        if (score < minFScore) {
          minFScore = score;
          current = id;
        }
      });

      if (!current || current === endId) break;

      openSet.delete(current);
      closedSet.add(current);

      const currentNode = this.graph.get(current);
      if (currentNode) {
        currentNode.edges.forEach(edge => {
          if (closedSet.has(edge.target)) return;

          const tentativeGScore = (gScore.get(current) || Infinity) + edge.weight;

          if (!openSet.has(edge.target)) {
            openSet.add(edge.target);
          } else if (tentativeGScore >= (gScore.get(edge.target) || Infinity)) {
            return;
          }

          previous.set(edge.target, current);
          gScore.set(edge.target, tentativeGScore);
          fScore.set(edge.target, tentativeGScore + this.heuristic(edge.target, endId));
        });
      }
    }

    const path = this.reconstructPath(previous, startId, endId);
    if (path.length === 0) return null;

    const route = path.map(id => this.graph.get(id)?.location).filter(Boolean) as Location[];
    const totalDistance = this.calculateRouteDistance(route);
    const totalTime = this.calculateRouteTime(route);

    return {
      route,
      estimatedTime: totalTime,
      distance: totalDistance,
      algorithm: TRACKING_ALGORITHMS.FASTEST_ROUTE,
      confidence: 0.92
    };
  }

  // Heuristic function for A*
  private heuristic(nodeId: string, endId: string): number {
    const node = this.graph.get(nodeId);
    const endNode = this.graph.get(endId);
    
    if (!node || !endNode) return Infinity;
    
    const distance = this.calculateDistance(node.location, endNode.location);
    return this.calculateTime(distance);
  }

  // Reconstruct path from previous nodes
  private reconstructPath(previous: Map<string, string>, startId: string, endId: string): string[] {
    const path: string[] = [];
    let current: string | undefined = endId;

    while (current && current !== startId) {
      path.unshift(current);
      current = previous.get(current);
    }

    if (current === startId) {
      path.unshift(startId);
    }

    return path;
  }

  // Calculate total route distance
  private calculateRouteDistance(route: Location[]): number {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += this.calculateDistance(route[i], route[i + 1]);
    }
    return totalDistance;
  }

  // Calculate total route time
  private calculateRouteTime(route: Location[]): number {
    let totalTime = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalTime += this.calculateTime(this.calculateDistance(route[i], route[i + 1]));
    }
    return totalTime;
  }

  // Multi-stop route optimization
  public optimizeMultiStop(startId: string, stops: string[], endId: string): RouteOptimization | null {
    // Simple greedy algorithm for multi-stop optimization
    // In production, this would use more sophisticated algorithms like 2-opt or simulated annealing
    
    let bestRoute: string[] = [startId];
    let remainingStops = [...stops];
    let currentId = startId;

    while (remainingStops.length > 0) {
      let nearestStop: string | null = null;
      let minDistance = Infinity;

      remainingStops.forEach(stopId => {
        const distance = this.calculateDistance(
          this.graph.get(currentId)?.location!,
          this.graph.get(stopId)?.location!
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestStop = stopId;
        }
      });

      if (nearestStop) {
        bestRoute.push(nearestStop);
        remainingStops = remainingStops.filter(id => id !== nearestStop);
        currentId = nearestStop;
      }
    }

    bestRoute.push(endId);

    // Calculate route metrics
    const route = bestRoute.map(id => this.graph.get(id)?.location).filter(Boolean) as Location[];
    const totalDistance = this.calculateRouteDistance(route);
    const totalTime = this.calculateRouteTime(route);

    return {
      route,
      estimatedTime: totalTime,
      distance: totalDistance,
      algorithm: TRACKING_ALGORITHMS.MULTI_STOP_OPTIMIZATION,
      confidence: 0.78
    };
  }

  // Get nearest node to a location
  public getNearestNode(location: Location): string | null {
    let nearestId: string | null = null;
    let minDistance = Infinity;

    this.graph.forEach((node, id) => {
      const distance = this.calculateDistance(location, node.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearestId = id;
      }
    });

    return nearestId;
  }

  // Update traffic data
  public updateTrafficData(segmentId: string, trafficFactor: number) {
    this.trafficData.set(segmentId, trafficFactor);
  }
}

// Export singleton instance
export const fastTrackingAlgorithms = new FastTrackingAlgorithms();
