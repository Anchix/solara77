import { products } from "@/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminProducts = () => (
  <Card>
    <CardHeader><CardTitle className="text-lg">Products</CardTitle></CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2">Image</th><th className="pb-2">Name</th><th className="pb-2">Category</th><th className="pb-2">Price</th><th className="pb-2">Sale Price</th><th className="pb-2">Discount</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2"><img src={p.images[0]} alt={p.name} className="w-10 h-10 object-contain bg-secondary rounded" /></td>
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2 text-muted-foreground">{p.category}</td>
                <td className="py-2">₹{p.price}</td>
                <td className="py-2">{p.salePrice ? `₹${p.salePrice}` : "—"}</td>
                <td className="py-2">{p.discount || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Products are currently hardcoded. Database-driven product management coming soon.</p>
    </CardContent>
  </Card>
);

export default AdminProducts;
