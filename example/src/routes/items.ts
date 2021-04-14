export function get(req, res) {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
}

export function post(req, res) {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
}
