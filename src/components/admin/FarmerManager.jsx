import React, { useState, useEffect } from "react";
import {
  Leaf,
  MapPin,
  CheckCircle,
  Search,
  Award,
  Store,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
  BadgeCheck,
} from "lucide-react";
import farmerService from "../../services/farmerService.js";
import { useToast, SkeletonCard, EmptyState } from "../shared/index.jsx";

export default function FarmerManager() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const toast = useToast();

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await farmerService.getAdminFarmers();
      setFarmers(res?.data || []);
    } catch (err) {
      toast("Failed to load farmers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleToggleActive = async (farmerId, currentActive) => {
    const nextActive = !currentActive;
    try {
      await farmerService.updateFarmerStatus(farmerId, {
        isActive: nextActive,
      });
      toast(
        `Farmer status is now ${nextActive ? "Active" : "Suspended"}`,
        "success",
      );
      setFarmers(
        farmers.map((f) =>
          f._id === farmerId ? { ...f, isActive: nextActive } : f,
        ),
      );
    } catch (err) {
      toast("Failed to update status", "error");
    }
  };

  const handleToggleApproved = async (farmerId, currentApproved) => {
    const nextApproved = !currentApproved;
    try {
      await farmerService.updateFarmerStatus(farmerId, {
        isVerifiedFarmer: nextApproved,
      });
      toast(
        `Farmer approval set to ${nextApproved ? "Verified & Approved" : "Pending Verification"}`,
        "success",
      );
      setFarmers(
        farmers.map((f) =>
          f._id === farmerId ? { ...f, isVerifiedFarmer: nextApproved } : f,
        ),
      );
    } catch (err) {
      toast("Failed to update approval", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the profile for "${name || "this farmer"}"?`,
      )
    )
      return;
    try {
      await farmerService.deleteProfile(id);
      toast("Farmer profile deleted successfully", "info");
      setFarmers(farmers.filter((f) => f._id !== id));
    } catch (err) {
      toast("Failed to delete farmer", "error");
    }
  };

  const filtered = farmers.filter((f) => {
    if (!f) return false;
    const q = search ? search.toLowerCase().trim() : "";
    const matchesSearch =
      !q ||
      (f.farmName || "").toLowerCase().includes(q) ||
      (f.user?.name || "").toLowerCase().includes(q) ||
      (f.user?.email || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q) ||
      (f.contactPerson || "").toLowerCase().includes(q) ||
      (f.market?.name || "").toLowerCase().includes(q) ||
      (f.stallNumber || "").toLowerCase().includes(q) ||
      (f.address || "").toLowerCase().includes(q) ||
      (f.location?.city || "").toLowerCase().includes(q) ||
      (f.phone || "").toLowerCase().includes(q) ||
      (f.specialties || []).some((s) => (s || "").toLowerCase().includes(q));

    if (filterActive === "active") return matchesSearch && f.isActive !== false;
    if (filterActive === "suspended")
      return matchesSearch && f.isActive === false;
    if (filterActive === "verified")
      return matchesSearch && Boolean(f.isVerifiedFarmer);
    return matchesSearch;
  });

  const verifiedCount = farmers.filter((f) => f.isVerifiedFarmer).length;
  const activeCount = farmers.filter((f) => f.isActive !== false).length;

  return (
    <div className="admin-section-container">
      {/* Page Header */}
      <div className="admin-page-hero">
        <div className="admin-page-hero__text">
          <div className="admin-badge-pill emerald">
            <Leaf size={14} /> Agricultural Producer Directory
          </div>
          <h1 className="admin-page-title">
            Registered Farmers &amp; Stall Directory
          </h1>
          <p className="admin-page-subtitle">
            Manage local organic growers, verify stall profiles, assign weekend
            market hubs, and toggle platform selling permissions.
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="admin-hero-stats">
          <div className="hero-stat-box">
            <span className="hero-stat-label">Total Growers</span>
            <span className="hero-stat-val text-emerald">
              {loading ? "…" : farmers.length}
            </span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-label">Verified Stalls</span>
            <span className="hero-stat-val text-blue">
              {loading ? "…" : verifiedCount}
            </span>
          </div>
          <div className="hero-stat-box">
            <span className="hero-stat-label">Active Sellers</span>
            <span className="hero-stat-val text-emerald">
              {loading ? "…" : activeCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-toolbar-card">
        <div className="admin-search-wrapper">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search farm name, grower, market hub, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-field"
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>
              
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          <div className="filter-pill-toggle">
            <button
              className={`filter-pill-btn ${filterActive === "" ? "active" : ""}`}
              onClick={() => setFilterActive("")}
            >
              All ({farmers.length})
            </button>
            <button
              className={`filter-pill-btn ${filterActive === "verified" ? "active" : ""}`}
              onClick={() => setFilterActive("verified")}
            >
               Verified ({verifiedCount})
            </button>
            <button
              className={`filter-pill-btn ${filterActive === "active" ? "active" : ""}`}
              onClick={() => setFilterActive("active")}
            >
               Active ({activeCount})
            </button>
            <button
              className={`filter-pill-btn ${filterActive === "suspended" ? "active" : ""}`}
              onClick={() => setFilterActive("suspended")}
            >
               Suspended ({farmers.length - activeCount})
            </button>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={fetchFarmers}
            title="Refresh growers list"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="admin-table-loading">
          <SkeletonCard height={320} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-card">
          <EmptyState
            icon={Leaf}
            title="No Farmers Found"
            description={
              search
                ? `No grower matched "${search}".`
                : "No farmer accounts registered yet."
            }
          />
        </div>
      ) : (
        <div className="admin-modern-table-card">
          <div className="table-responsive">
            <table className="admin-modern-table">
              <thead>
                <tr>
                  <th>Farm Stall &amp; Brand</th>
                  <th>Manager / Contact</th>
                  <th>Farmers Market Hub</th>
                  <th>Operating Days</th>
                  <th>Verification &amp; Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const isVerified = Boolean(f.isVerifiedFarmer);
                  const isActive = f.isActive !== false;
                  return (
                    <tr
                      key={f._id}
                      className={!isActive ? "row-deactivated" : ""}
                    >
                      <td>
                        <div className="user-profile-cell">
                          <div className="avatar-gradient-circle green">
                            <Leaf size={16} />
                          </div>
                          <div className="user-profile-text">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <strong className="user-name-title">
                                {f.farmName || "Organic Farm"}
                              </strong>
                              {isVerified && (
                                <span
                                  title="Verified Producer"
                                  style={{ color: "#10b981", display: "flex" }}
                                >
                                  <BadgeCheck size={16} />
                                </span>
                              )}
                            </div>
                            <span className="user-email-subtitle">
                              {f.stallNumber
                                ? `Stall #${f.stallNumber} • `
                                : ""}
                              {f.location?.city || "Local Farm"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="contact-cell">
                          <strong className="farmer-manager-name">
                            {f.contactPerson || f.user?.name || "Farm Manager"}
                          </strong>
                          <span className="contact-chip phone">
                            <Phone size={11} />{" "}
                            {f.phone || f.user?.phone || "No phone"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="location-cell">
                          {f.market?.name ? (
                            <span className="location-chip">
                              <Store size={12} /> {f.market.name}
                            </span>
                          ) : (
                            <span className="text-muted-sm">
                              Unassigned Hub
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                            maxWidth: 160,
                          }}
                        >
                          {f.operatingDays && f.operatingDays.length > 0 ? (
                            f.operatingDays.slice(0, 3).map((day, dIdx) => (
                              <span key={dIdx} className="day-badge-pill">
                                {day.substring(0, 3)}
                              </span>
                            ))
                          ) : (
                            <span className="day-badge-pill">Sat / Sun</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            alignItems: "flex-start",
                          }}
                        >
                          <button
                            type="button"
                            className={`badge-verification-btn ${isVerified ? "verified" : "unverified"}`}
                            onClick={() =>
                              handleToggleApproved(f._id, isVerified)
                            }
                            title="Click to toggle official verification badge"
                          >
                            {isVerified
                              ? " Verified Producer"
                              : " Pending Review"}
                          </button>

                          <span
                            className={`status-badge-glow ${isActive ? "active" : "suspended"}`}
                          >
                            <span className="status-dot" />
                            {isActive ? "Active" : "Suspended"}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            className={`admin-toggle-status-btn ${isActive ? "deactivate" : "activate"}`}
                            onClick={() => handleToggleActive(f._id, isActive)}
                            title={
                              isActive
                                ? "Suspend farmer account"
                                : "Reactivate farmer account"
                            }
                          >
                            {isActive ? "Suspend" : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="admin-icon-action-btn delete"
                            onClick={() => handleDelete(f._id, f.farmName)}
                            title="Delete farmer profile"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
