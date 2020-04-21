/**
 * @author Nicolaus Rossi
 * @since 2020-04-20
 */

/**
 * Determines the vector between to given points.
 * @param  {FloatArray} point_a coordinates of point A
 * @param  {FloatArray} point_b coordinates of point B
 */
function determineVector(pointA, pointB) {
    return [Math.abs(pointA[0] - pointB[0]), Math.abs(pointA[1] - pointB[1])]
}

/**
 * Given a set of points (x, y), determines all vertex points of it's
 * respective convex hull using the `Jarvis' March / Gift wrapping`
 * method.
 * @param  {FloatArray} set_of_points Integer Array that contains x- and y-coordinates of all points
 */
function generateConvexHull(points) {
    // Container for all vertex points of the convex hull.
    const VERTEX = []
    
    // If there are less than 3 points, no convex hull can be created.
    // If there are exactly 3 points, those 3 points are simultaneously the only
    // vertex points of the convex hull.
    if (points.length <= 3) {
        return points
    }

    // Sorts all points by their x- and y-coordinates ascendingly.
    points.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    pointOnHull = points[0]

    let index = 0 
    let endPoint

    do {
        VERTEX[index] = pointOnHull
        endPoint = points[0]

        for (let j = 0; j < points.length; j++) {
            if (endPoint === pointOnHull || points[j][1] < this.determineVector(VERTEX[index], endPoint)[1]) {
                endPoint = points[j]
            }
            index += 1
            pointOnHull = endPoint
        }
    } while (endPoint != VERTEX[0]) 

    return VERTEX
}




