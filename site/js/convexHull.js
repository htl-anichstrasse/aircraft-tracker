/**
 * Determines the vertex of the convex hull of a given set of points.
 * @param {FloatArray} points Array which holds Lat-Lon coordinates.
 */
function grahamScan(points) {
  // If there are less than 3 points, no convex hull can be formed.
  // If there are exactly 3 points, those 3 points are simultaneously 
  // the vertex of the convex hull.
  if (points.length <= 3) {
    return points
  }
  
  // Find pivot
  let pivot = points[0]
  for (let i = 0; i < points.length; i++) {
    if (points[i][1] < pivot[1] || (points[i][1] === pivot[1] && points[i][0] < pivot[0])) {
      pivot = points[i]
    }
  }

  // Attribute an angle to the points
  for (let i = 0; i < points.length; i++) {
    points[i]._graham_angle = Math.atan2(points[i][1] - pivot[1], points[i][0] - pivot[0])
  }

  points.sort((a, b) => {
    return a._graham_angle === b._graham_angle ? 
    a[0] - b[0] : 
    a._graham_angle - b._graham_angle
  })

  // Adding points to the result if they "turn left"
  let result = [points[0]]
  len = 1
  for (let i = 1; i < points.length; i++) {
    let a = result[len - 2]
    let b = result[len - 1] 
    let c = points[i]

    while ((len === 1 && b[0] === c[0] && b[1] === c[1]) || (len > 1 && (b[0] - a[0]) * (c[1] - a[1]) <= (b[1] - a[1]) * (c[0] - a[0]))) {
        len -= 1
        b = a
        a = result[len - 2]
    }
    result[len++] = c
  }
  result.length = len
  return result
}