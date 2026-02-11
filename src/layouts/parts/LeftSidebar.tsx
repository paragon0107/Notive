import type { HomeConfig } from "@/libs/types/blog";
import { DEFAULT_PROFILE_ROLE } from "@/libs/site-config";

const DEFAULT_ICON = "●";

const resolveContactHref = (type: string, value: string) => {
  if (!value) return "#";
  const normalized = type.toLowerCase();
  if (normalized === "email") return `mailto:${value}`;
  if (normalized === "github") return `https://github.com/${value}`;
  if (normalized === "linkedin")
    return value.startsWith("http")
      ? value
      : `https://linkedin.com/in/${value}`;
  return value.startsWith("http") ? value : `https://${value}`;
};

type Props = {
  home: HomeConfig;
};

export const LeftSidebar = ({ home }: Props) => {
  return (
    <div className="sidebar-profile">
      <div className="profile">
        {home.profileImageUrl ? (
          <img
            src={home.profileImageUrl}
            alt={home.profileName ?? "profile"}
            className="profile__image"
          />
        ) : (
          <div className="profile__image profile__placeholder" />
        )}
        <div className="profile__name">{home.profileName ?? home.blogName}</div>
        <div className="profile__role">
          {home.aboutMe || DEFAULT_PROFILE_ROLE}
        </div>
      </div>

      {home.projects.length > 0 ? (
        <section className="profile-section">
          <h3>Projects</h3>
          <ul>
            {home.projects.map((project) => (
              <li key={project.id}>
                <a href={project.link ?? "#"}>
                  <span className="project-icon">
                    {project.iconUrl ? (
                      <img src={project.iconUrl} alt="" />
                    ) : (
                      DEFAULT_ICON
                    )}
                  </span>
                  {project.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {home.contacts.length > 0 ? (
        <section className="profile-section">
          <h3>Contact</h3>
          <ul className="contact-list">
            {home.contacts.map((contact) => (
              <li key={contact.id}>
                <a href={resolveContactHref(contact.type, contact.value)}>
                  {contact.iconUrl ? (
                    <img src={contact.iconUrl} alt="" />
                  ) : (
                    <span className="contact-icon">{DEFAULT_ICON}</span>
                  )}
                  <span>{contact.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
