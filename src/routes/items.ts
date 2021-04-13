export function get(req, res) {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
}
