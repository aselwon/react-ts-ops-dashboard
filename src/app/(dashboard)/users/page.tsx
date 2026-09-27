import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { users } from "@/lib/domain";
export default async function Page() {
  const user = await getUser();
  if (user?.role !== "admin") redirect("/tickets");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PEOPLE</span>
          <h1>
            Team members<span className="heading-dot">.</span>
          </h1>
          <p>The people behind a great support experience.</p>
        </div>
        <span className="period">Admin only</span>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Workspace members</h2>
            <p>Demo directory · Member management is outside this MVP.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="role-tag">{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
