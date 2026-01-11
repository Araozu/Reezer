using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Reezer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SongDuration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "YtSongs",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );

            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "Songs",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Duration", table: "YtSongs");

            migrationBuilder.DropColumn(name: "Duration", table: "Songs");
        }
    }
}
